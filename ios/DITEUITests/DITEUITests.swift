import XCTest
import UIKit

/// These tests interact with the real bundled page through accessibility and touch.
/// No DOM test API or direct game-state mutation is used. One Debug-only launch flag injects a graphics failure.
final class DITEUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .landscapeLeft
        app = XCUIApplication()
        app.launchArguments = ["--ui-testing", "--ui-testing-reset-store"]
        app.launch()
        waitForButton("Entra nel gioco", timeout: 90)
    }

    override func tearDownWithError() throws {
        if let failureCount = testRun?.failureCount, failureCount > 0 {
            attachScreenshot("failure")
            let tree = XCTAttachment(string: app.debugDescription)
            tree.name = "Accessibility tree on failure"
            tree.lifetime = .keepAlways
            add(tree)
        }
        app.terminate()
    }

    func testBundledGameControlsPauseAndReturnFromSettings() {
        attachScreenshot("lobby-landscape-left")
        tap("Entra nel gioco")
        tap("Pausa")
        XCTAssertTrue(button("Riprendi partita").isHittable)
        tap("Impostazioni")
        tap("Indietro")
        XCTAssertTrue(button("Riprendi partita").isHittable, "Settings must return to pause")
        attachScreenshot("pause")
        tap("Riprendi partita")
        waitForButton("Pausa")
        attachScreenshot("game")
    }

    func testBothLandscapeOrientationsKeepControlsReachable() {
        for orientation in [UIDeviceOrientation.landscapeLeft, .landscapeRight] {
            XCUIDevice.shared.orientation = orientation
            waitForButton("Entra nel gioco")
            tap("Entra nel gioco")
            tap("Pausa")
            let pause = button("Riprendi partita")
            XCTAssertTrue(pause.isHittable)
            XCTAssertTrue(app.frame.intersects(pause.frame))
            attachScreenshot(orientation == .landscapeLeft ? "landscape-left" : "landscape-right")
            // A cold launch returns to the actual lobby and tests startup in the next orientation.
            app.terminate()
            app.launchArguments = ["--ui-testing"]
            app.launch()
            waitForButton("Entra nel gioco", timeout: 90)
        }
    }

    func testBackgroundRequiresExplicitResume() {
        tap("Entra nel gioco")
        waitForButton("Pausa")
        XCUIDevice.shared.press(.home)
        app.activate()
        waitForButton("Riprendi partita")
        attachScreenshot("paused-after-background")
        tap("Riprendi partita")
        waitForButton("Pausa")
    }

    func testPreferencePersistsAfterApplicationRelaunch() {
        tap("Impostazioni")
        tap("Grafica e comfort")
        let control = reducedMotionControl()
        XCTAssertTrue(control.waitForExistence(timeout: 10))
        let before = String(describing: control.value)
        control.tap()
        let changed = NSPredicate { _, _ in String(describing: control.value) != before }
        expectation(for: changed, evaluatedWith: control)
        waitForExpectations(timeout: 10)
        let after = String(describing: control.value)
        // Wait for the user-visible acknowledgement, not a guessed disk-write duration.
        let saved = app.staticTexts.matching(NSPredicate(format: "label == %@", "Salvato sul dispositivo")).firstMatch
        XCTAssertTrue(saved.waitForExistence(timeout: 15), "The native save must be acknowledged")
        app.terminate()
        app.launchArguments = ["--ui-testing"]
        app.launch()
        waitForButton("Entra nel gioco", timeout: 90)
        tap("Impostazioni")
        tap("Grafica e comfort")
        let restored = reducedMotionControl()
        XCTAssertTrue(restored.waitForExistence(timeout: 10))
        XCTAssertEqual(String(describing: restored.value), after)
        attachScreenshot("preference-restored")
    }

    func testForgeKeyboardRequiresATapAndCanCloseAfterRotation() {
        tap("Officina")
        waitForButton("Annulla")
        let unexpectedKeyboard = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true"), object: app.keyboards.firstMatch)
        unexpectedKeyboard.isInverted = true
        XCTAssertEqual(XCTWaiter.wait(for: [unexpectedKeyboard], timeout: 2), .completed,
                       "Entering the forge must not focus a text field")
        attachScreenshot("forge-without-keyboard")
        let name = app.textFields.matching(NSPredicate(format: "label == %@", "Nome del kit")).firstMatch
        XCTAssertTrue(name.waitForExistence(timeout: 10))
        name.tap()
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 10))
        name.typeText(" prova")
        tap("Chiudi tastiera")
        waitForNoKeyboard()

        let query = NSPredicate(format: "label == %@", "Cerca poteri per nome, effetto o famiglia")
        let search = app.searchFields.matching(query).firstMatch.exists
            ? app.searchFields.matching(query).firstMatch : app.textFields.matching(query).firstMatch
        XCTAssertTrue(search.waitForExistence(timeout: 10))
        search.tap()
        XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 10))
        search.typeText("fuoco")
        XCUIDevice.shared.orientation = .landscapeRight
        tap("Chiudi tastiera")
        waitForNoKeyboard()
        XCTAssertGreaterThan(app.frame.width, app.frame.height)
        attachScreenshot("forge-after-keyboard-and-rotation")
        tap("Annulla")
        waitForButton("Entra nel gioco")
        waitForNoKeyboard()
    }

    func testWebGLFailureRetriesThroughAFreshNativeBootstrap() {
        app.terminate()
        app.launchArguments = ["--ui-testing", "--ui-testing-reset-store", "--ui-testing-fail-webgl-once"]
        app.launch()
        waitForButton("Riprova", timeout: 90)
        XCTAssertTrue(app.staticTexts["La grafica non si avvia"].exists)
        attachScreenshot("webgl-first-start-failure")
        tap("Riprova")
        waitForButton("Entra nel gioco", timeout: 90)
        tap("Entra nel gioco")
        waitForButton("Pausa")
        attachScreenshot("webgl-retry-restored-game")
    }

    private func reducedMotionControl() -> XCUIElement {
        // WebKit can expose HTML checkboxes as switches or generic descendants, depending on OS.
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ AND value != nil", "Movimento ridotto")).firstMatch
    }

    private func waitForNoKeyboard() {
        let absent = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.keyboards.firstMatch)
        XCTAssertEqual(XCTWaiter.wait(for: [absent], timeout: 10), .completed)
    }

    private func button(_ label: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label == %@", label)).firstMatch
    }

    @discardableResult private func waitForButton(_ label: String, timeout: TimeInterval = 20) -> XCUIElement {
        let element = button(label)
        let visible = NSPredicate(format: "exists == true AND hittable == true")
        let result = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: visible, object: element)], timeout: timeout)
        XCTAssertEqual(result, .completed, "Missing reachable control: \(label)")
        return element
    }

    private func tap(_ label: String) { waitForButton(label).tap() }

    private func attachScreenshot(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
