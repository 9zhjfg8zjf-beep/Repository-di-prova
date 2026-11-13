import XCTest
@testable import DITE

final class GameSaveStoreTests: XCTestCase {
    private var directory: URL!
    private var store: GameSaveStore!

    override func setUpWithError() throws {
        directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        store = GameSaveStore(directory: directory)
    }

    override func tearDownWithError() throws {
        if FileManager.default.fileExists(atPath: directory.path) {
            try FileManager.default.removeItem(at: directory)
        }
    }

    func testFirstLaunchIsDistinctFromDamagedStorage() throws {
        let first = store.load()
        XCTAssertNil(first.snapshot)
        XCTAssertNil(first.error)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        try Data("not JSON".utf8).write(to: store.fileURL)
        let damaged = store.load()
        XCTAssertNil(damaged.snapshot)
        XCTAssertEqual(damaged.error, "corrupt")
    }

    func testSaveSurvivesANewStoreInstanceAndPreservesUnicode() throws {
        let snapshot: [String: Any] = ["schemaVersion": 3, "fame": 21, "muted": false,
                                       "recipe": ["nome": "Città d’ombra </script>", "slots": []],
                                       "onboarding": ["done": true], "journal": ["seen": ["dite"]]]
        try store.save(snapshot)
        let reopened = GameSaveStore(directory: directory).load()
        XCTAssertNil(reopened.error)
        XCTAssertEqual(reopened.snapshot as NSDictionary?, snapshot as NSDictionary)
    }

    func testLegacyMigrationKeepsAnUnmodifiedRecoveryCopy() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let original = Data("{\"schemaVersion\":2,\"fame\":35}".utf8)
        try original.write(to: store.fileURL)
        XCTAssertEqual(store.load().snapshot?["fame"] as? Int, 35)
        try store.save(["schemaVersion": 3, "fame": 35])
        XCTAssertEqual(try Data(contentsOf: store.recoveryURL), original)
        XCTAssertEqual(store.load().snapshot?["schemaVersion"] as? Int, 3)
    }

    func testFutureSchemaAndCorruptDataArePreservedBeforeReplacement() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        for original in [Data("{\"schemaVersion\":999,\"future\":true}".utf8), Data([0, 255, 8])] {
            try original.write(to: store.fileURL)
            XCTAssertEqual(store.load().error, "corrupt")
            try store.save(["schemaVersion": 3])
            XCTAssertEqual(try Data(contentsOf: store.rawRecoveryURL), original)
        }
    }

    func testSemanticallyInvalidCurrentSchemaKeepsRawInputAndBoundedRecoverySlots() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let original = Data("{\"schemaVersion\":3,\"recipe\":\"not a recipe\",\"fame\":42}".utf8)
        try original.write(to: store.fileURL)
        XCTAssertNotNil(store.load().snapshot, "JS must receive the object for semantic normalization")
        try store.save(["schemaVersion": 3, "recipe": ["slots": []], "fame": 42])
        try store.save(["schemaVersion": 3, "fame": 43])
        XCTAssertEqual(try Data(contentsOf: store.recoveryURL), original, "Subsequent saves must retain pre-normalization bytes")
        let nextSession = GameSaveStore(directory: directory)
        let beforeNextSession = try Data(contentsOf: store.fileURL)
        XCTAssertNotNil(nextSession.load().snapshot)
        try nextSession.save(["schemaVersion": 3, "fame": 44])
        XCTAssertEqual(try Data(contentsOf: nextSession.recoveryURL), beforeNextSession)
        let files = try FileManager.default.contentsOfDirectory(atPath: directory.path)
        XCTAssertEqual(Set(files), ["progress.json", "progress.previous.json", "progress.raw.json"])
    }

    func testUnreadableCurrentRestoresPreviousAndRetainsRecoveryOnFailedWrite() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let corrupt = Data("damaged current".utf8)
        let previous = try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "fame": 19])
        try corrupt.write(to: store.fileURL)
        try previous.write(to: store.recoveryURL)
        let failing = GameSaveStore(directory: directory, writer: { data, url in
            if url.lastPathComponent == "progress.json" { throw NSError(domain: NSPOSIXErrorDomain, code: 5) }
            try data.write(to: url, options: .atomic)
        })
        let recovered = failing.load()
        XCTAssertEqual(recovered.error, "corrupt")
        XCTAssertEqual(recovered.snapshot?["fame"] as? Int, 19)
        XCTAssertThrowsError(try failing.save(["schemaVersion": 3, "fame": 20]))
        XCTAssertEqual(try Data(contentsOf: failing.fileURL), corrupt)
        XCTAssertEqual(try Data(contentsOf: failing.recoveryURL), previous, "The only readable checkpoint must survive")
        XCTAssertEqual(try Data(contentsOf: failing.rawRecoveryURL), corrupt)
        let reopened = GameSaveStore(directory: directory)
        XCTAssertEqual(reopened.load().snapshot?["fame"] as? Int, 19)
        try reopened.save(["schemaVersion": 3, "fame": 20])
        XCTAssertEqual(reopened.load().snapshot?["fame"] as? Int, 20)
        XCTAssertEqual(try Data(contentsOf: reopened.recoveryURL), previous)
    }

    func testRawBackupFailureCannotOverwriteCurrentOrPrevious() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let original = try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "fame": 7])
        let previous = try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "fame": 6])
        try original.write(to: store.fileURL)
        try previous.write(to: store.recoveryURL)
        let failing = GameSaveStore(directory: directory, writer: { data, url in
            if url.lastPathComponent == "progress.raw.json" { throw NSError(domain: NSPOSIXErrorDomain, code: 5) }
            try data.write(to: url, options: .atomic)
        })
        _ = failing.load()
        XCTAssertThrowsError(try failing.save(["schemaVersion": 3, "fame": 8]))
        XCTAssertEqual(try Data(contentsOf: failing.fileURL), original)
        XCTAssertEqual(try Data(contentsOf: failing.recoveryURL), previous)
    }

    func testMissingCurrentUsesReadablePreviousInsteadOfPretendingFirstLaunch() throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "fame": 32]).write(to: store.recoveryURL)
        let recovered = store.load()
        XCTAssertEqual(recovered.error, "corrupt")
        XCTAssertEqual(recovered.snapshot?["fame"] as? Int, 32)
        try store.save(["schemaVersion": 3, "fame": 33])
        XCTAssertEqual(store.load().snapshot?["fame"] as? Int, 33)
    }

    func testRejectedSaveCannotDamagePreviousData() throws {
        try store.save(["schemaVersion": 3, "fame": 5])
        let original = try Data(contentsOf: store.fileURL)
        XCTAssertThrowsError(try store.save(["schemaVersion": 3, "large": String(repeating: "x", count: 300_000)]))
        XCTAssertThrowsError(try store.save(["schemaVersion": 4]))
        XCTAssertEqual(try Data(contentsOf: store.fileURL), original)
    }

    func testWriteFailureIsReported() throws {
        try Data("This path is a file, not a save directory".utf8).write(to: directory)
        XCTAssertThrowsError(try store.save(["schemaVersion": 3])) { error in
            guard case SaveError.unavailable = error else { return XCTFail("Wrong failure: \(error)") }
        }
    }

    func testInterleavedReadsNeverSeePartialJSON() throws {
        try store.save(["schemaVersion": 3, "fame": 0])
        let done = expectation(description: "all atomic writes")
        done.expectedFulfillmentCount = 24
        for value in 1...24 {
            DispatchQueue.global().async { [store] in
                do {
                    try store?.save(["schemaVersion": 3, "fame": value])
                    XCTAssertEqual(store?.load().snapshot?["schemaVersion"] as? Int, 3)
                } catch { XCTFail("Atomic save failed: \(error)") }
                done.fulfill()
            }
        }
        wait(for: [done], timeout: 10)
    }
}
