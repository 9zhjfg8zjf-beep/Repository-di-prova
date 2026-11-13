import UIKit
import WebKit
import AVFAudio
import CoreHaptics

final class GameViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private(set) var webView: WKWebView!
    private var navigationPolicy: GameNavigationPolicy?
    private var store: GameSaveStore!
    private let saveQueue = DispatchQueue(label: "dite.local-save", qos: .userInitiated)
    private var pendingWrites = 0
    private var backgroundSave: UIBackgroundTaskIdentifier = .invalid
    private var pageGeneration = 0
    private var ready = false
    private var awaitingReady = false
    private var networkRulesReady = false
    private var hostActive = false
    private var audioInterrupted = false
    private var playing = false
    private var readyTimer: Timer?
    private var interruptionObserver: NSObjectProtocol?
    private var lastHaptic = Date.distantPast
    private let hasHaptics = CHHapticEngine.capabilitiesForHardware().supportsHaptics
    private let overlay = UIView()
    private let statusLabel = UILabel()
    private let detailLabel = UILabel()
    private let retryButton = UIButton(type: .system)
    private let activity = UIActivityIndicatorView(style: .large)

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation { .landscapeRight }
    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.035, green: 0.031, blue: 0.043, alpha: 1)
        hostActive = UIApplication.shared.applicationState == .active
        configureStore()
        configureWebView()
        configureOverlay()
        configureAudio()
        prepareOfflineRules()
    }

    private func configureStore() {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        var directory = base.appendingPathComponent("DITE", isDirectory: true)
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("--ui-testing") {
            // Separate test data: a UI run never erases the person's actual progress.
            directory = base.appendingPathComponent("DITE-UI-Tests", isDirectory: true)
            if ProcessInfo.processInfo.arguments.contains("--ui-testing-reset-store") {
                try? FileManager.default.removeItem(at: directory)
            }
        }
        #endif
        store = GameSaveStore(directory: directory)
    }

    private func configureWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsAirPlayForMediaPlayback = false
        configuration.mediaTypesRequiringUserActionForPlayback = .all
        configuration.userContentController.add(WeakScriptHandler(self), name: "dite")
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = view.backgroundColor
        webView.scrollView.backgroundColor = view.backgroundColor
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false
        webView.accessibilityIdentifier = "dite.game"
        #if DEBUG
        webView.isInspectable = true
        #endif
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func configureOverlay() {
        overlay.backgroundColor = view.backgroundColor
        overlay.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(overlay)
        NSLayoutConstraint.activate([
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        statusLabel.font = .preferredFont(forTextStyle: .title2)
        statusLabel.textColor = .white
        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.accessibilityIdentifier = "dite.host.status"
        detailLabel.font = .preferredFont(forTextStyle: .body)
        detailLabel.textColor = UIColor(white: 0.78, alpha: 1)
        detailLabel.textAlignment = .center
        detailLabel.numberOfLines = 0
        retryButton.setTitle("Riapri il gioco", for: .normal)
        retryButton.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        retryButton.tintColor = UIColor(red: 1, green: 0.74, blue: 0.38, alpha: 1)
        retryButton.accessibilityIdentifier = "dite.host.retry"
        retryButton.addTarget(self, action: #selector(retryLoading), for: .touchUpInside)
        let stack = UIStackView(arrangedSubviews: [activity, statusLabel, detailLabel, retryButton])
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: overlay.safeAreaLayoutGuide.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: overlay.safeAreaLayoutGuide.centerYAnchor),
            stack.widthAnchor.constraint(lessThanOrEqualToConstant: 560),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: overlay.safeAreaLayoutGuide.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: overlay.safeAreaLayoutGuide.trailingAnchor, constant: -24),
            retryButton.heightAnchor.constraint(greaterThanOrEqualToConstant: 44)
        ])
    }

    private func configureAudio() {
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
        ) { [weak self] notification in
            guard let self,
                  let raw = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
            self.audioInterrupted = type == .began
            // The web state machine requires a new explicit gesture even when shouldResume is present.
            self.sendLifecycle(reason: self.audioInterrupted ? "audio-interruption" : "audio-available")
            self.updateAudioAndIdleTimer()
        }
    }

    private func prepareOfflineRules() {
        overlay.isHidden = false
        statusLabel.text = "Preparo DITE…"
        detailLabel.text = "Il gioco non richiede servizi online."
        retryButton.isHidden = true
        activity.startAnimating()
        let rules = "[{\"trigger\":{\"url-filter\":\"^(https?|wss?)://\"},\"action\":{\"type\":\"block\"}}]"
        WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "DITELocalOnlyV1", encodedContentRuleList: rules) { [weak self] rules, _ in
            DispatchQueue.main.async {
                guard let self else { return }
                guard let rules else {
                    self.showFailure("Impossibile preparare l’avvio offline.", detail: "Puoi riprovare. I dati salvati restano disponibili.")
                    return
                }
                self.webView.configuration.userContentController.add(rules)
                self.networkRulesReady = true
                self.loadGame()
            }
        }
    }

    @objc private func retryLoading() {
        if networkRulesReady { loadGame() } else { prepareOfflineRules() }
    }

    private func loadGame() {
        readyTimer?.invalidate()
        pageGeneration += 1
        ready = false
        awaitingReady = true
        playing = false
        updateAudioAndIdleTimer()
        overlay.isHidden = false
        statusLabel.text = "Apro DITE…"
        detailLabel.text = "Il gioco è disponibile anche senza connessione."
        retryButton.isHidden = true
        activity.startAnimating()
        guard let entry = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game") else {
            showFailure("Risorse del gioco mancanti.", detail: "Reinstalla l’app da una distribuzione completa.")
            return
        }
        let external = (Bundle.main.object(forInfoDictionaryKey: "DITEExternalURLs") as? [String] ?? []).compactMap(URL.init(string:))
        navigationPolicy = GameNavigationPolicy(entryURL: entry, externalURLs: external)
        let loaded = store.load()
        let bootstrap: [String: Any] = [
            "v": BridgeMessage.version,
            "platform": "ios",
            "active": hostActive && !audioInterrupted,
            "storage": loaded.snapshot as Any? ?? NSNull(),
            "storageError": loaded.error as Any? ?? NSNull(),
            "capabilities": ["storage": true, "haptics": hasHaptics]
        ]
        guard let encoded = try? JSONSerialization.data(withJSONObject: bootstrap, options: [.sortedKeys]),
              let json = String(data: encoded, encoding: .utf8) else {
            showFailure("Impossibile preparare il gioco.", detail: "I dati salvati non sono stati cancellati.")
            return
        }
        let controller = webView.configuration.userContentController
        controller.removeAllUserScripts()
        let script = "Object.defineProperty(window,'__DITE_HOST__',{value:Object.freeze(\(json)),writable:false,configurable:false});"
        controller.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        webView.loadFileURL(entry, allowingReadAccessTo: entry.deletingLastPathComponent())
        readyTimer = Timer.scheduledTimer(withTimeInterval: 45, repeats: false) { [weak self] _ in
            guard let self, self.awaitingReady else { return }
            self.showFailure("Il gioco non ha completato l’avvio.", detail: "Puoi riprovare. I kit e i progressi salvati restano disponibili.")
        }
    }

    func setHostActive(_ active: Bool, reason: String) {
        hostActive = active
        if isViewLoaded {
            sendLifecycle(reason: reason)
            updateAudioAndIdleTimer()
        }
    }

    private func sendLifecycle(reason: String) {
        send(["v": BridgeMessage.version, "type": "lifecycle", "active": hostActive && !audioInterrupted, "reason": reason])
    }

    private func updateAudioAndIdleTimer() {
        let activeGame = hostActive && !audioInterrupted && playing && ready && !awaitingReady
        UIApplication.shared.isIdleTimerDisabled = activeGame
        if activeGame {
            try? AVAudioSession.sharedInstance().setActive(true)
        } else {
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        }
    }

    private func send(_ object: [String: Any]) {
        guard ready,
              let data = try? JSONSerialization.data(withJSONObject: object),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.DiteNative && window.DiteNative.receive(\(json));") { _, _ in
            // Page teardown can race a lifecycle message. The next ready handshake resends current state.
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "dite", message.frameInfo.isMainFrame,
              navigationPolicy?.isGameDocument(message.frameInfo.request.url) == true else { return }
        guard let decoded = BridgeMessage.decode(message.body) else {
            if let body = message.body as? [String: Any], body["type"] as? String == "save",
               BridgeMessage.integer(body["v"]) == BridgeMessage.version,
               let id = BridgeMessage.integer(body["id"]), id > 0 {
                send(["v": 1, "type": "saveResult", "id": id, "ok": false, "error": "invalid"])
            }
            return
        }
        switch decoded {
        case .ready:
            guard !ready, awaitingReady else { return }
            ready = true
            // Storage installs the bridge before the engine starts; a handshake alone is not a playable page.
            sendLifecycle(reason: "ready")
        case let .save(id, snapshot):
            guard ready else { return }
            save(snapshot, id: id)
        case let .state(screen, isPlaying):
            guard ready else { return }
            if awaitingReady && screen != "boot" && screen != "loading" {
                awaitingReady = false
                readyTimer?.invalidate()
                activity.stopAnimating()
                overlay.isHidden = true
            }
            playing = isPlaying
            updateAudioAndIdleTimer()
        case let .haptic(style):
            guard ready, hostActive, !audioInterrupted, hasHaptics else { return }
            let interval = Date().timeIntervalSince(lastHaptic)
            guard interval < 0 || interval >= 0.08 else { return }
            lastHaptic = Date()
            if style == "success" {
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            } else {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        }
    }

    private func save(_ snapshot: [String: Any], id: Int) {
        guard pendingWrites < 16 else {
            send(["v": 1, "type": "saveResult", "id": id, "ok": false, "error": "unavailable"])
            return
        }
        pendingWrites += 1
        if backgroundSave == .invalid {
            backgroundSave = UIApplication.shared.beginBackgroundTask(withName: "Salvataggio DITE") { [weak self] in
                self?.endBackgroundSave()
            }
        }
        let generation = pageGeneration
        let saveStore = store!
        saveQueue.async { [weak self] in
            let saveFailure: String?
            do {
                try saveStore.save(snapshot)
                saveFailure = nil
            } catch SaveError.invalid {
                saveFailure = "invalid"
            } catch {
                saveFailure = "unavailable"
            }
            DispatchQueue.main.async {
                guard let self else { return }
                self.pendingWrites -= 1
                if self.pendingWrites == 0 { self.endBackgroundSave() }
                guard generation == self.pageGeneration else { return }
                self.send(["v": 1, "type": "saveResult", "id": id, "ok": saveFailure == nil, "error": saveFailure as Any? ?? NSNull()])
            }
        }
    }

    private func endBackgroundSave() {
        if backgroundSave != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundSave)
            backgroundSave = .invalid
        }
    }

    private func showFailure(_ title: String, detail: String) {
        send(["v": 1, "type": "lifecycle", "active": false, "reason": "host-error"])
        ready = false
        awaitingReady = false
        playing = false
        readyTimer?.invalidate()
        updateAudioAndIdleTimer()
        webView.stopLoading()
        activity.stopAnimating()
        statusLabel.text = title
        detailLabel.text = detail
        retryButton.isHidden = false
        overlay.isHidden = false
        UIAccessibility.post(notification: .screenChanged, argument: statusLabel)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        showFailure("La sessione di gioco è stata interrotta.", detail: "Riapri il gioco dal rifugio. I kit e i progressi già salvati restano disponibili.")
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        navigationFailed(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        navigationFailed(error)
    }

    private func navigationFailed(_ error: Error) {
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        showFailure("Impossibile aprire il gioco.", detail: "Puoi riprovare senza connessione. I dati salvati non sono stati cancellati.")
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if action.targetFrame?.isMainFrame == true && navigationPolicy?.isGameDocument(action.request.url) == true {
            decisionHandler(.allow)
        } else {
            openExternalIfAllowed(action)
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        openExternalIfAllowed(action)
        return nil
    }

    private func openExternalIfAllowed(_ action: WKNavigationAction) {
        guard navigationPolicy?.canOpenExternally(action.request.url, userActivated: action.navigationType == .linkActivated) == true,
              let url = action.request.url else { return }
        UIApplication.shared.open(url)
    }

    deinit {
        readyTimer?.invalidate()
        if let interruptionObserver { NotificationCenter.default.removeObserver(interruptionObserver) }
    }
}

private final class WeakScriptHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?
    init(_ delegate: WKScriptMessageHandler) {
        self.delegate = delegate
        super.init()
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}
