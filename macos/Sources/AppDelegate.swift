import AppKit
import Carbon
import SwiftUI
import WebKit

final class NativeBridge: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        NSLog("paperclip native message: %@", String(describing: message.body))
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var panel: NSPanel!
    private var webView: WKWebView!
    private var aboutWindow: NSWindow?
    private var hotKey: GlobalHotKey?
    private var resignObserver: NSObjectProtocol?

    private let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0.3.0"

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupPanel()
        setupStatusItem()
        hotKey = GlobalHotKey(keyCode: UInt32(kVK_ANSI_P), modifiers: UInt32(cmdKey | optionKey)) { [weak self] in
            self?.toggleDesk()
        }
        resignObserver = NotificationCenter.default.addObserver(
            forName: NSApplication.didResignActiveNotification, object: nil, queue: .main
        ) { [weak self] _ in
            self?.panel.orderOut(nil)
        }
    }

    // MARK: - Panel

    private func setupPanel() {
        let config = WKWebViewConfiguration()
        let userContent = WKUserContentController()
        let inject = WKUserScript(
            source: "window.PaperclipNative = {platform:'macos', version:'\(appVersion)'};",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        userContent.addUserScript(inject)
        userContent.add(NativeBridge(), name: "native")
        config.userContentController = userContent

        webView = WKWebView(frame: .zero, configuration: config)
        if let webDir = Bundle.main.resourceURL?.appendingPathComponent("web", isDirectory: true) {
            let index = webDir.appendingPathComponent("index.html")
            webView.loadFileURL(index, allowingReadAccessTo: webDir)
        }

        panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 1100, height: 720),
            styleMask: [.nonactivatingPanel, .titled, .closable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isMovableByWindowBackground = true
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        panel.minSize = NSSize(width: 720, height: 480)
        panel.contentView = NSHostingView(rootView: DeskRootView(webView: webView))
        panel.center()
    }

    private func toggleDesk() {
        if panel.isVisible {
            panel.orderOut(nil)
        } else {
            showDesk()
        }
    }

    private func showDesk() {
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // MARK: - Status item + menu

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            if let image = NSImage(named: "StatusIcon") {
                image.isTemplate = true
                image.size = NSSize(width: 18, height: 18)
                button.image = image
            } else {
                button.title = "📎"
            }
            button.toolTip = "FR!sky Paperclip"
        }

        let menu = NSMenu()
        let show = NSMenuItem(title: "Show Desk", action: #selector(menuShowDesk), keyEquivalent: "p")
        show.keyEquivalentModifierMask = [.option, .command]
        menu.addItem(show)
        menu.addItem(NSMenuItem(title: "Open clip.friskydev.com", action: #selector(menuOpenSite), keyEquivalent: ""))
        menu.addItem(.separator())
        menu.addItem(NSMenuItem(title: "About FR!sky Paperclip", action: #selector(menuAbout), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(menuQuit), keyEquivalent: "q"))
        menu.items.forEach { $0.target = self }
        statusItem.menu = menu
    }

    @objc private func menuShowDesk() { toggleDesk() }

    @objc private func menuOpenSite() {
        if let url = URL(string: "https://clip.friskydev.com") {
            NSWorkspace.shared.open(url)
        }
    }

    @objc private func menuAbout() {
        if aboutWindow == nil {
            let window = NSWindow(
                contentRect: NSRect(x: 0, y: 0, width: 340, height: 220),
                styleMask: [.titled, .closable],
                backing: .buffered,
                defer: false
            )
            window.title = "About FR!sky Paperclip"
            window.contentView = NSHostingView(rootView: AboutView(version: appVersion))
            window.isReleasedWhenClosed = false
            window.center()
            aboutWindow = window
        }
        aboutWindow?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func menuQuit() { NSApp.terminate(nil) }
}
