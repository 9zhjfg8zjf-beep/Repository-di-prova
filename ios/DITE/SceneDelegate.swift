import UIKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var game: GameViewController? { window?.rootViewController as? GameViewController }

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession,
               options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = GameViewController()
        window.makeKeyAndVisible()
        self.window = window
    }

    func sceneWillResignActive(_ scene: UIScene) {
        game?.setHostActive(false, reason: "inactive")
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        game?.setHostActive(false, reason: "background")
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        game?.setHostActive(true, reason: "foreground")
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        game?.setHostActive(false, reason: "disconnected")
    }
}
