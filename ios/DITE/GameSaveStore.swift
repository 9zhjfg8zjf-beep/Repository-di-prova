import Foundation

/// Native and browser use the same schema. Semantic migration belongs to storage.js.
/// No UserDefaults, remote service or credentials are involved.
final class GameSaveStore {
    typealias Writer = (Data, URL) throws -> Void
    struct Loaded {
        let snapshot: [String: Any]?
        let error: String?
    }

    let directory: URL
    private let fileManager: FileManager
    private let writeData: Writer
    private let lock = NSLock()
    private var preservePreviousFile = true
    var fileURL: URL { directory.appendingPathComponent("progress.json", isDirectory: false) }
    var recoveryURL: URL { directory.appendingPathComponent("progress.previous.json", isDirectory: false) }
    var rawRecoveryURL: URL { directory.appendingPathComponent("progress.raw.json", isDirectory: false) }

    init(directory: URL, fileManager: FileManager = .default, writer: Writer? = nil) {
        self.directory = directory
        self.fileManager = fileManager
        self.writeData = writer ?? { data, url in
            try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        }
    }

    func load() -> Loaded {
        lock.lock()
        defer { lock.unlock() }
        guard fileManager.fileExists(atPath: fileURL.path) else {
            preservePreviousFile = false
            if let previous = loadPrevious() { return Loaded(snapshot: previous, error: "corrupt") }
            return Loaded(snapshot: nil, error: nil)
        }
        // Native does not know the catalogue. Even valid schema-3 JSON may need semantic repair in JS.
        preservePreviousFile = true
        do {
            let data = try Data(contentsOf: fileURL)
            guard let snapshot = decodeStored(data) else {
                return Loaded(snapshot: loadPrevious(), error: "corrupt")
            }
            return Loaded(snapshot: snapshot, error: nil)
        } catch {
            if let previous = loadPrevious() { return Loaded(snapshot: previous, error: "corrupt") }
            return Loaded(snapshot: nil, error: "unavailable")
        }
    }

    private func decodeStored(_ data: Data) -> [String: Any]? {
        guard data.count <= BridgeMessage.maximumSnapshotBytes,
              let snapshot = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else { return nil }
        let schema = BridgeMessage.integer(snapshot["schemaVersion"]) ?? 0
        return schema >= 0 && schema <= BridgeMessage.schemaVersion ? snapshot : nil
    }

    private func loadPrevious() -> [String: Any]? {
        guard let data = try? Data(contentsOf: recoveryURL) else { return nil }
        return decodeStored(data)
    }

    func save(_ snapshot: [String: Any]) throws {
        lock.lock()
        defer { lock.unlock() }
        let data = try BridgeMessage.encodedSnapshot(snapshot)
        do {
            try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
            var original: Data?
            if preservePreviousFile && fileManager.fileExists(atPath: fileURL.path) {
                // Preserve raw bytes first, without replacing a usable previous checkpoint.
                let raw = try Data(contentsOf: fileURL)
                try writeData(raw, rawRecoveryURL)
                original = raw
            }
            try writeData(data, fileURL)
            preservePreviousFile = false
            // Only promote readable input after the new current file is safely committed.
            // If promotion fails, both current and raw are already safe and previous stays untouched.
            if let original, decodeStored(original) != nil { try? writeData(original, recoveryURL) }
        } catch {
            throw SaveError.unavailable
        }
    }
}
