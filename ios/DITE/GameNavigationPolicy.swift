import Foundation

struct GameNavigationPolicy {
    let entryURL: URL
    let externalURLs: Set<URL>

    init(entryURL: URL, externalURLs: [URL] = []) {
        self.entryURL = entryURL.standardizedFileURL.resolvingSymlinksInPath()
        self.externalURLs = Set(externalURLs.filter {
            $0.scheme?.lowercased() == "https" && $0.host != nil && $0.user == nil && $0.password == nil
        })
    }

    func isGameDocument(_ url: URL?) -> Bool {
        guard let url, url.isFileURL, url.query == nil else { return false }
        // Fragments are safe local UI navigation; paths outside this exact entry point are not.
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        components?.fragment = nil
        guard let clean = components?.url else { return false }
        return clean.standardizedFileURL.resolvingSymlinksInPath() == entryURL
    }

    func canOpenExternally(_ url: URL?, userActivated: Bool) -> Bool {
        guard userActivated, let url else { return false }
        return externalURLs.contains(url)
    }
}
