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
            // Failure diagnostics must never wait, assert, or recurse into the content guard.
            attachRawScreenshot(XCUIScreen.main.screenshot(), named: "failure")
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

    func testBundledGameControlsPauseAndReturnFromSettings() throws {
        try assertScreenshotContentContract()
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
        // The native iPhone and iPad scenes observed in CI fill the screen.
        // Home must cause a real OS background transition before we test resuming.
        XCUIDevice.shared.press(.home)
        states.append("after Home: \(app.state.rawValue)")
        let background = NSPredicate { _, _ in
            self.app.state == .runningBackground || self.app.state == .runningBackgroundSuspended
        }
        let backgroundResult = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: background, object: app)], timeout: 10)
        states.append("after background wait: \(app.state.rawValue)")
        attachText(states.joined(separator: "\n"), named: "Observed application lifecycle states before activation")
        // SpringBoard is diagnostic evidence, not an app-content readiness assertion.
        attachRawScreenshot(XCUIScreen.main.screenshot(), named: "system-after-background-action")
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

    private func attachWindowGeometry(_ name: String) {
        let probe = app.descendants(matching: .any).matching(identifier: "dite.ui-test.window-geometry").firstMatch
        let detail = probe.exists ? probe.value as? String ?? "unavailable" : "missing geometry probe"
        let webView = app.webViews.firstMatch
        let webFrame = webView.exists ? NSCoder.string(for: webView.frame) : "unavailable"
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
        var firstRejected: XCUIScreenshot?
        var last: XCUIScreenshot?
        var accepted: XCUIScreenshot?
        var attempts: [String] = []
        let started = ProcessInfo.processInfo.systemUptime
        let painted = NSPredicate { _, _ in
            let screenshot = XCUIScreen.main.screenshot()
            last = screenshot
            let content = screenshot.image.cgImage.map(self.screenshotContent)
            let elapsed = ProcessInfo.processInfo.systemUptime - started
            attempts.append("attempt=\(attempts.count + 1); elapsed=\(elapsed); \(content?.description ?? "image unavailable")")
            if content?.isVisible == true {
                // Keep the exact sample that passed; taking another screenshot would reopen the race.
                accepted = screenshot
                return true
            }
            if firstRejected == nil { firstRejected = screenshot }
            return false
        }
        let result = XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: painted, object: nil)], timeout: 20)
        attachText(attempts.joined(separator: "\n"), named: "Screenshot content observations " + name)
        if let firstRejected {
            attachRawScreenshot(firstRejected, named: name + "-first-unpainted")
        }
        if result != .completed, let last {
            attachRawScreenshot(last, named: name + "-last-unpainted")
        }
        XCTAssertEqual(result, .completed, "The app screenshot must contain visible content: \(name)")
        if let accepted { attachRawScreenshot(accepted, named: name) }
    }

    private func attachRawScreenshot(_ screenshot: XCUIScreenshot, named name: String) {
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private struct ScreenshotContent {
        let visiblePixels: Int
        let contrastingPixels: Int
        let contrastingCells: Int
        var isVisible: Bool { visiblePixels >= 32 && contrastingPixels >= 16 && contrastingCells >= 2 }
        var description: String {
            "visiblePixels=\(visiblePixels); contrastingPixels=\(contrastingPixels); contrastingCells=\(contrastingCells); content=\(isVisible)"
        }
    }

    private func screenshotContent(_ image: CGImage) -> ScreenshotContent {
        let empty = ScreenshotContent(visiblePixels: 0, contrastingPixels: 0, contrastingCells: 0)
        let side = 64
        // The central 80% excludes system bars. This is a blank-frame guard, not visual approval.
        let crop = CGRect(x: CGFloat(image.width) * 0.1, y: CGFloat(image.height) * 0.1,
                          width: CGFloat(image.width) * 0.8, height: CGFloat(image.height) * 0.8).integral
        guard let cropped = image.cropping(to: crop) else { return empty }
        var rgba = [UInt8](repeating: 0, count: side * side * 4)
        let bitmapInfo = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue
        let rendered = rgba.withUnsafeMutableBytes { bytes -> Bool in
            guard let context = CGContext(data: bytes.baseAddress, width: side, height: side,
                                          bitsPerComponent: 8, bytesPerRow: side * 4,
                                          space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: bitmapInfo) else { return false }
            context.interpolationQuality = .none
            context.draw(cropped, in: CGRect(x: 0, y: 0, width: CGFloat(side), height: CGFloat(side)))
            return true
        }
        guard rendered else { return empty }
        var pixels: [(r: Int, g: Int, b: Int, cell: Int)] = []
        for index in 0..<(side * side) {
            let offset = index * 4
            let alpha = Int(rgba[offset + 3])
            guard alpha >= 16 else { continue }
            // Unpremultiply RGB: changing only alpha must not turn a uniform image into content.
            func channel(_ component: Int) -> Int {
                min(255, (Int(rgba[offset + component]) * 255 + alpha / 2) / alpha)
            }
            let cell = (index / side / 16) * 4 + (index % side / 16)
            pixels.append((channel(0), channel(1), channel(2), cell))
        }
        guard pixels.count >= 32 else { return empty }
        let middle = pixels.count / 2
        let median = (pixels.map { $0.r }.sorted()[middle], pixels.map { $0.g }.sorted()[middle],
                      pixels.map { $0.b }.sorted()[middle])
        var contrasting = 0
        var cells = Set<Int>()
        for pixel in pixels {
            if max(abs(pixel.r - median.0), max(abs(pixel.g - median.1), abs(pixel.b - median.2))) >= 16 {
                contrasting += 1
                cells.insert(pixel.cell)
            }
        }
        return ScreenshotContent(visiblePixels: pixels.count, contrastingPixels: contrasting, contrastingCells: cells.count)
    }

    private func assertScreenshotContentContract() throws {
        // Exercise the real sampler within an existing UI test; these are not screenshot evidence.
        let side = 64
        func sample(_ pixel: (Int, Int) -> [UInt8]) throws -> ScreenshotContent {
            var bytes: [UInt8] = []
            for y in 0..<side { for x in 0..<side { bytes.append(contentsOf: pixel(x, y)) } }
            let provider = try XCTUnwrap(CGDataProvider(data: Data(bytes) as CFData))
            let bitmapInfo = CGBitmapInfo(rawValue: CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue)
            let image = try XCTUnwrap(CGImage(width: side, height: side, bitsPerComponent: 8, bitsPerPixel: 32,
                                             bytesPerRow: side * 4, space: CGColorSpaceCreateDeviceRGB(),
                                             bitmapInfo: bitmapInfo, provider: provider, decode: nil,
                                             shouldInterpolate: false, intent: .defaultIntent))
            return screenshotContent(image)
        }
        XCTAssertFalse(try sample { _, _ in [9, 8, 11, 255] }.isVisible, "The observed native blank must fail")
        XCTAssertFalse(try sample { _, _ in [255, 255, 255, 255] }.isVisible, "A bright uniform frame must fail")
        XCTAssertFalse(try sample { _, _ in [0, 0, 0, 0] }.isVisible, "A transparent frame must fail")
        XCTAssertFalse(try sample { x, _ in let a: UInt8 = x < 32 ? 64 : 255; return [a, a, a, a] }.isVisible,
                       "Alpha-only variation must fail")
        XCTAssertFalse(try sample { x, y in x == 32 && y == 32 ? [255, 255, 255, 255] : [9, 8, 11, 255] }.isVisible,
                       "A lone bright pixel must fail")
        XCTAssertTrue(try sample { x, _ in x < 32 ? [9, 8, 11, 255] : [220, 160, 40, 255] }.isVisible,
                      "Visible content across the frame must pass")
    }
}
