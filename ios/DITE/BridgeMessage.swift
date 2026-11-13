import Foundation
import CoreFoundation

/// The host accepts a small, versioned protocol; it never accepts JS or file paths.
enum BridgeMessage {
    static let version = 1
    static let schemaVersion = 3
    static let maximumSnapshotBytes = 256 * 1024

    case ready
    case save(id: Int, data: [String: Any])
    case state(screen: String, playing: Bool)
    case haptic(style: String)

    static func decode(_ body: Any) -> BridgeMessage? {
        guard let object = body as? [String: Any],
              integer(object["v"]) == version,
              let type = object["type"] as? String else { return nil }
        switch type {
        case "ready":
            guard keys(object, are: ["v", "type", "schemaVersion"]),
                  integer(object["schemaVersion"]) == schemaVersion else { return nil }
            return .ready
        case "save":
            guard keys(object, are: ["v", "type", "id", "data"]),
                  let id = integer(object["id"]), id > 0,
                  let snapshot = object["data"] as? [String: Any],
                  (try? encodedSnapshot(snapshot)) != nil else { return nil }
            return .save(id: id, data: snapshot)
        case "state":
            guard keys(object, are: ["v", "type", "screen", "playing"]),
                  let screen = object["screen"] as? String,
                  !screen.isEmpty, screen.utf8.count <= 48,
                  screen.unicodeScalars.allSatisfy({ CharacterSet.alphanumerics.contains($0) || $0 == "-" || $0 == "_" }),
                  let playing = boolean(object["playing"]) else { return nil }
            return .state(screen: screen, playing: playing)
        case "haptic":
            guard keys(object, are: ["v", "type", "style"]),
                  let style = object["style"] as? String,
                  ["light", "success"].contains(style) else { return nil }
            return .haptic(style: style)
        default:
            return nil
        }
    }

    static func encodedSnapshot(_ snapshot: [String: Any]) throws -> Data {
        guard integer(snapshot["schemaVersion"]) == schemaVersion,
              JSONSerialization.isValidJSONObject(snapshot) else { throw SaveError.invalid }
        let data = try JSONSerialization.data(withJSONObject: snapshot, options: [.sortedKeys])
        guard data.count <= maximumSnapshotBytes else { throw SaveError.invalid }
        return data
    }

    static func integer(_ value: Any?) -> Int? {
        guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() else { return nil }
        let double = number.doubleValue
        guard double.isFinite, double.rounded(.towardZero) == double,
              abs(double) <= 9_007_199_254_740_991 else { return nil }
        return Int(double)
    }

    private static func boolean(_ value: Any?) -> Bool? {
        guard let number = value as? NSNumber, CFGetTypeID(number) == CFBooleanGetTypeID() else { return nil }
        return number.boolValue
    }

    private static func keys(_ object: [String: Any], are expected: Set<String>) -> Bool {
        Set(object.keys) == expected
    }
}

enum SaveError: Error {
    case invalid
    case unavailable
}
