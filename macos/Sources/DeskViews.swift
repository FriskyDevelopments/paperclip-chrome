import SwiftUI
import WebKit

// Doctrine palette.
extension Color {
    static let paperclipRed = Color(red: 1.0, green: 0x33 / 255, blue: 0x4e / 255)
    static let paperclipInk = Color(red: 0x07 / 255, green: 0x10 / 255, blue: 0x12 / 255)
    static let paperclipCream = Color(red: 0xf1 / 255, green: 0xee / 255, blue: 0xe7 / 255)
    static let paperclipGold = Color(red: 0xf1 / 255, green: 0xb7 / 255, blue: 0x5c / 255)
}

struct WebViewContainer: NSViewRepresentable {
    let webView: WKWebView

    func makeNSView(context: Context) -> WKWebView { webView }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

struct DeskRootView: View {
    let webView: WKWebView

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                Text("FR!SKY PAPERCLIP")
                    .font(.system(.title3, design: .default).weight(.heavy))
                    .foregroundStyle(Color.paperclipInk)
                Text("THE AGENT DESK")
                    .font(.system(.caption2, design: .monospaced).weight(.bold))
                    .foregroundStyle(Color.paperclipInk.opacity(0.55))
                Spacer()
                Button("STAMP") { bridge("stamp") }
                    .buttonStyle(.borderedProminent)
                    .tint(.paperclipRed)
                    .keyboardShortcut("s", modifiers: [.command, .option])
                Button("HALT") { bridge("halt") }
                    .buttonStyle(.borderedProminent)
                    .tint(.paperclipInk)
                    .keyboardShortcut("h", modifiers: [.command, .option])
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color.paperclipCream)
            Divider()
            WebViewContainer(webView: webView)
        }
    }

    private func bridge(_ op: String) {
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('frisky-native',{detail:{op:'\(op)'}}))",
            completionHandler: nil
        )
    }
}

struct AboutView: View {
    let version: String

    var body: some View {
        VStack(spacing: 10) {
            Text("FR!SKY PAPERCLIP")
                .font(.system(.title2, design: .default).weight(.heavy))
                .foregroundStyle(Color.paperclipInk)
            Text("THE AGENT DESK")
                .font(.system(.caption, design: .monospaced).weight(.bold))
                .foregroundStyle(Color.paperclipRed)
            Text("Version \(version)")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(Color.paperclipInk.opacity(0.7))
            Text("Grok plans. You stamp. Clip clicks.")
                .font(.system(.callout, design: .default))
                .foregroundStyle(Color.paperclipInk)
            Text("© 2026 Frisky Developments LLC")
                .font(.caption)
                .foregroundStyle(Color.paperclipInk.opacity(0.5))
        }
        .padding(24)
        .frame(width: 340, height: 220)
        .background(Color.paperclipCream)
    }
}
