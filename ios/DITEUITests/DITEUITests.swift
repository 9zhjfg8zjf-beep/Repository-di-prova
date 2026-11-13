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
        let probe = app.descendants(matching: .any).matching(identifier: "dite.ui-test.events").firstMatch
        if probe.exists, let value = probe.value as? String {
            let trace = XCTAttachment(string: value)
            trace.name = "Passive native and web event trace"
            trace.lifetime = .keepAlways
            add(trace)
        }
        app.terminate()
    }

    func testBundledGameControlsPauseAndReturnFromSettings() {
        attachScreenshot("lobby-landscape-left")
        tap("Entra nel gioco")
        tap("Pausa")
        waitForButton("Riprendi partita")
        tap("Impostazioni")
        tap("Indietro")
        waitForButton("Riprendi partita") // Settings must return to pause, never resume automatically.
        attachScreenshot("pause")
        tap("Riprendi partita")
        waitForButton("Pausa")
        attachScreenshot("game")
    }

    func testBothLandscapeOrientationsKeepControlsReachable() {
        // Apple defines opposite landscape names for device and interface orientation.
        // https://developer.apple.com/documentation/UIKit/UIInterfaceOrientation
        let cases: [(device: UIDeviceOrientation, interface: String)] = [
            (.landscapeLeft, "landscapeRight"), (.landscapeRight, "landscapeLeft")
        ]
        var observed = Set<String>()
        for (index, orientation) in cases.enumerated() {
            XCUIDevice.shared.orientation = orientation.device
            if index > 0 {
                // First prove a live rotation reaches the other UI orientation.
                waitForInterfaceOrientation(orientation.interface)
                waitForButton("Riprendi partita")
                attachScreenshot("rotated-pause-ui-" + orientation.interface)
                // The new device orientation is already set before this cold launch.
                app.terminate()
                app.launchArguments = ["--ui-testing"]
                app.launch()
            }
            waitForButton("Entra nel gioco", timeout: 90)
            observed.insert(waitForInterfaceOrientation(orientation.interface))
            tap("Entra nel gioco")
            tap("Pausa")
            let pause = waitForButton("Riprendi partita")
            XCTAssertTrue(app.frame.intersects(pause.frame))
            attachScreenshot("cold-launch-pause-ui-" + orientation.interface)
            if index == 0 {
                // Rotate a live game, so an already-open pause cannot satisfy the assertion.
                tap("Riprendi partita")
                waitForButton("Pausa")
            }
        }
        XCTAssertEqual(observed, Set(["landscapeLeft", "landscapeRight"]))
    }

    func testBackgroundRequiresExplicitResume() {
        tap("Entra nel gioco")
        waitForButton("Pausa")
        var states = ["before system action: \(app.state.rawValue)"]
        attachWindowGeometry("before-background")
        if UIDevice.current.userInterfaceIdiom == .pad {
            // Home can leave a window visible and active at the edge in Windowed Apps.
            // Use the real system Minimize control while the game window is reachable.
            guard minimizePadWindow() else { return }
            states.append("after system Minimize: \(app.state.rawValue)")
        } else {
            XCUIDevice.shared.press(.home)
            states.append("after Home: \(app.state.rawValue)")
        }
        let background = NSPredicate { _, _ in
            self.app.state == .runningBackground || self.app.state == .runningBackgroundSuspended
        }
        let backgroundResult = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: background, object: app)], timeout: 10)
        states.append("after background wait: \(app.state.rawValue)")
        attachText(states.joined(separator: "\n"), named: "Observed application lifecycle states before activation")
        attachScreenshot("system-after-background-action")
        XCTAssertEqual(backgroundResult, .completed,
                       "The app must actually enter the background before activation")
        app.activate()
        let foreground = app.wait(for: .runningForeground, timeout: 10)
        states.append("after activation: \(app.state.rawValue)")
        attachText(states.joined(separator: "\n"), named: "Observed application lifecycle states after activation")
        attachWindowGeometry("after-activation")
        XCTAssertTrue(foreground)
        waitForButton("Riprendi partita")
        attachScreenshot("paused-after-background")
        tap("Riprendi partita")
        waitForButton("Pausa")
    }

    func testPreferencePersistsAfterApplicationRelaunch() {
        tap("Impostazioni")
        tap("Grafica e comfort")
        let control = reducedMotionControl()
        let reachable = NSPredicate(format: "exists == true AND hittable == true")
        XCTAssertEqual(XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: reachable, object: control)], timeout: 10), .completed,
                       "The reduced-motion switch must be reachable")
        guard let before = control.value as? String, ["0", "1"].contains(before) else {
            XCTFail("Expected a boolean switch value, got \(String(describing: control.value))")
            return
        }
        let after = before == "0" ? "1" : "0"
        control.tap()
        let changed = NSPredicate(format: "exists == true AND value == %@", after)
        XCTAssertEqual(XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: changed, object: control)], timeout: 10), .completed,
                       "The reduced-motion switch must change to the opposite boolean value")
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
        XCTAssertEqual(restored.value as? String, after)
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
        app.switches.matching(NSPredicate(format: "label == %@", "Movimento ridotto")).firstMatch
    }

    private func waitForNoKeyboard() {
        let absent = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.keyboards.firstMatch)
        XCTAssertEqual(XCTWaiter.wait(for: [absent], timeout: 10), .completed)
    }

    @discardableResult private func waitForInterfaceOrientation(_ expected: String) -> String {
        let probe = app.descendants(matching: .any).matching(identifier: "dite.ui-test.interface-orientation").firstMatch
        let actual = NSPredicate(format: "exists == true AND value == %@", expected)
        let result = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: actual, object: probe)], timeout: 20)
        let value = probe.exists ? probe.value as? String ?? "unavailable" : "missing probe"
        // Capture before asserting: continueAfterFailure=false can skip all following code.
        attachText("expected=\(expected)\neffective=\(value)", named: "Actual window orientation")
        attachWindowGeometry("orientation-" + expected)
        XCTAssertEqual(result, .completed, "The actual UIWindowScene must reach \(expected)")
        XCTAssertGreaterThan(app.frame.width, app.frame.height, "The rendered app must remain landscape")
        return value
    }

    private func minimizePadWindow() -> Bool {
        let system = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let minimize = system.buttons.matching(NSPredicate(format: "label == %@", "Minimize"))
        if minimize.count != 1 || !minimize.element(boundBy: 0).isHittable {
            guard let controls = waitForSystemButton("Window Controls", in: system) else { return false }
            controls.tap()
        }
        guard let control = waitForSystemButton("Minimize", in: system) else { return false }
        attachScreenshot("system-minimize-control")
        control.tap()
        return true
    }

    private func waitForSystemButton(_ label: String, in system: XCUIApplication) -> XCUIElement? {
        let matches = system.buttons.matching(NSPredicate(format: "label == %@", label))
        let reachable = NSPredicate { _, _ in
            matches.count == 1 && matches.element(boundBy: 0).isHittable
        }
        let result = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: reachable, object: system)], timeout: 10)
        guard result == .completed else {
            // System control labels are platform-owned; preserve their real tree on failure.
            attachText(system.debugDescription, named: "System accessibility tree for " + label)
            attachWindowGeometry("missing-system-control")
            attachScreenshot("missing-system-control")
            XCTFail("Expected one reachable system control: \(label); found \(matches.count)")
            return nil
        }
        return matches.element(boundBy: 0)
    }

    private func attachWindowGeometry(_ name: String) {
        let probe = app.descendants(matching: .any).matching(identifier: "dite.ui-test.window-geometry").firstMatch
        let detail = probe.exists ? probe.value as? String ?? "unavailable" : "missing geometry probe"
        let webView = app.webViews.firstMatch
        let webFrame = webView.exists ? NSStringFromCGRect(webView.frame) : "unavailable"
        attachText("\(detail)\nXCUIApplication.state=\(app.state.rawValue)\napp.frame=\(app.frame)\nwebView.frame=\(webFrame)",
                   named: "Window geometry " + name)
    }

    private func attachText(_ text: String, named name: String) {
        let evidence = XCTAttachment(string: text)
        evidence.name = name
        evidence.lifetime = .keepAlways
        add(evidence)
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
