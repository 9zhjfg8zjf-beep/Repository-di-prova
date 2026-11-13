import XCTest
import WebKit
@testable import DITE

final class GameNavigationPolicyTests: XCTestCase {
    let entry = URL(fileURLWithPath: "/private/app/Game/index.html")

    @MainActor
    func testOfflineRulesCompileInWebKit() throws {
        let store = try XCTUnwrap(WKContentRuleListStore.default())
        let identifier = "DITEOfflineRulesTest-" + UUID().uuidString
        let compiled = expectation(description: "Production offline rules compile in WebKit")
        store.compileContentRuleList(forIdentifier: identifier, encodedContentRuleList: GameOfflineRules.encodedJSON) { rules, error in
            XCTAssertNil(error, "Offline startup must not fail on an unsupported content-blocker expression")
            XCTAssertNotNil(rules)
            store.removeContentRuleList(forIdentifier: identifier) { _ in compiled.fulfill() }
        }
        wait(for: [compiled], timeout: 30)
    }

    func testOnlyBundledEntryCanNavigate() {
        let policy = GameNavigationPolicy(entryURL: entry)
        XCTAssertTrue(policy.isGameDocument(entry))
        XCTAssertTrue(policy.isGameDocument(URL(string: entry.absoluteString + "#settings")))
        for value in ["https://example.invalid/index.html", "file:///private/app/Game/index.html.evil",
                      "file:///private/app/Game/../secret.json", "file:///private/app/Game/index.html?url=evil",
                      "javascript:alert(1)", "data:text/html,test", "about:blank"] {
            XCTAssertFalse(policy.isGameDocument(URL(string: value)), value)
        }
        XCTAssertFalse(policy.isGameDocument(nil))
    }

    func testExternalURLsNeedBothExplicitConfigurationAndUserAction() {
        let support = URL(string: "https://example.invalid/support")!
        let policy = GameNavigationPolicy(entryURL: entry, externalURLs: [support])
        XCTAssertTrue(policy.canOpenExternally(support, userActivated: true))
        XCTAssertFalse(policy.canOpenExternally(support, userActivated: false))
        XCTAssertFalse(policy.canOpenExternally(URL(string: "https://example.invalid/other"), userActivated: true))
        XCTAssertFalse(policy.canOpenExternally(URL(string: "https://example.invalid.evil/support"), userActivated: true))
        XCTAssertFalse(GameNavigationPolicy(entryURL: entry).canOpenExternally(support, userActivated: true))
        let unsafe = URL(string: "https://user:password@example.invalid/support")!
        XCTAssertFalse(GameNavigationPolicy(entryURL: entry, externalURLs: [unsafe]).canOpenExternally(unsafe, userActivated: true))
    }

    func testOnlyMainDocumentReloadRefreshesTheNativeBootstrap() {
        let policy = GameNavigationPolicy(entryURL: entry)
        XCTAssertTrue(policy.needsFreshBootstrap(entry, isMainFrame: true, isReload: true))
        XCTAssertFalse(policy.needsFreshBootstrap(entry, isMainFrame: true, isReload: false), "Initial load must not loop")
        XCTAssertFalse(policy.needsFreshBootstrap(entry, isMainFrame: false, isReload: true))
        XCTAssertFalse(policy.needsFreshBootstrap(URL(string: "https://example.invalid/"), isMainFrame: true, isReload: true))
        XCTAssertFalse(policy.needsFreshBootstrap(URL(fileURLWithPath: "/private/app/secret.json"), isMainFrame: true, isReload: true))
    }
}
