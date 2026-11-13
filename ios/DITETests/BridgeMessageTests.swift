import XCTest
@testable import DITE

final class BridgeMessageTests: XCTestCase {
    func testHandshakeRequiresMatchingProtocolAndSchema() {
        guard case .ready? = BridgeMessage.decode(["v": 1, "type": "ready", "schemaVersion": 3]) else {
            return XCTFail("The documented handshake must decode")
        }
        XCTAssertNil(BridgeMessage.decode(["v": 2, "type": "ready", "schemaVersion": 3]))
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "ready", "schemaVersion": 4]))
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "ready", "schemaVersion": 3, "script": "alert(1)"]))
    }

    func testSavePreservesSharedSnapshotWithoutInventingFields() {
        let snapshot: [String: Any] = ["schemaVersion": 3, "fame": 14, "muted": true,
                                       "saved": [], "journal": ["completed": ["one"]]]
        guard case let .save(id, data)? = BridgeMessage.decode(["v": 1, "type": "save", "id": 8, "data": snapshot]) else {
            return XCTFail("Valid save did not decode")
        }
        XCTAssertEqual(id, 8)
        XCTAssertEqual(data as NSDictionary, snapshot as NSDictionary)
    }

    func testRejectsWrongTypesAndUnsafeRequestIdentifiers() {
        let snapshot: [String: Any] = ["schemaVersion": 3]
        for id in [true, 0, -1, 1.25, 9_007_199_254_740_992.0, "1"] as [Any] {
            XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "save", "id": id, "data": snapshot]))
        }
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "save", "id": 1, "data": []]))
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "state", "screen": "game", "playing": 1]))
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "state", "screen": "../files", "playing": true]))
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "execute", "code": "alert(1)"]))
    }

    func testRejectsOversizedOrNonJSONSave() {
        XCTAssertThrowsError(try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "text": String(repeating: "x", count: 256 * 1024)]))
        XCTAssertThrowsError(try BridgeMessage.encodedSnapshot(["schemaVersion": 3, "value": Double.infinity]))
        XCTAssertThrowsError(try BridgeMessage.encodedSnapshot(["schemaVersion": 2]))
    }

    func testHapticsAreAnAllowlist() {
        guard case .haptic(style: "light")? = BridgeMessage.decode(["v": 1, "type": "haptic", "style": "light"]) else {
            return XCTFail("Documented haptic rejected")
        }
        XCTAssertNil(BridgeMessage.decode(["v": 1, "type": "haptic", "style": "unlimited", "duration": 100]))
    }
}
