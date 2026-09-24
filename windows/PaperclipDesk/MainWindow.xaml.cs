// FR!sky Paperclip Desk — WinUI 3 shell around a bundled WebView2 desk page.
// Mirrors macos/Sources/AppDelegate.swift + DeskViews.swift:
//   window.PaperclipNative bridge, STAMP/HALT -> `frisky-native` CustomEvent,
//   1100x720 window with a 720x480 minimum.
using Microsoft.UI;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics;

namespace PaperclipDesk;

public sealed partial class MainWindow : Window
{
    // Keep in lockstep with the extension + macOS desk (0.4.0 line).
    private const string DeskVersion = "0.4.0";

    private readonly Task _ready;

    public MainWindow()
    {
        InitializeComponent();

        // 1100x720 default, 720x480 minimum — same geometry as the macOS panel.
        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        var windowId = Win32Interop.GetWindowIdFromWindow(hwnd);
        var appWindow = AppWindow.GetFromWindowId(windowId);
        appWindow.Resize(new SizeInt32(1100, 720));
        if (appWindow.Presenter is OverlappedPresenter presenter)
        {
            presenter.PreferredMinimumWidth = 720;
            presenter.PreferredMinimumHeight = 480;
        }

        // Ctrl+Shift+P focuses the desk while the app is running (in-app
        // accelerator — NOT a system-wide hotkey; see windows/README.md).
        var focusDesk = new Microsoft.UI.Xaml.Input.KeyboardAccelerator
        {
            Modifiers = Windows.System.VirtualKeyModifiers.Control |
                        Windows.System.VirtualKeyModifiers.Shift,
            Key = Windows.System.VirtualKey.P,
        };
        focusDesk.Invoked += (_, _) => Activate();
        KeyboardAccelerators.Add(focusDesk);

        _ready = InitializeDeskAsync();
    }

    private async Task InitializeDeskAsync()
    {
        await DeskView.EnsureCoreWebView2Async();

        // Same bridge contract as macOS: window.PaperclipNative.
        await DeskView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
            $"window.PaperclipNative={{platform:'windows',version:'{DeskVersion}'}};");

        var webDir = Path.Combine(AppContext.BaseDirectory, "Assets", "web");
        var index = Path.Combine(webDir, "index.html");
        if (File.Exists(index))
        {
            DeskView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "paperclipdesk", webDir, CoreWebView2HostResourceAccessKind.DenyCors);
            DeskView.CoreWebView2.Navigate("https://paperclipdesk/index.html");
        }
        else
        {
            // Build script failed to stage the desk UI — surface it plainly.
            DeskView.NavigateToString(
                "<body style=\"background:#030708;color:#F1EEE7;font-family:sans-serif\">" +
                "<h1>FR!sky Paperclip Desk</h1>" +
                "<p>Bundled desk UI missing (Assets\\web\\index.html not found). " +
                "Re-run windows\\build-windows.ps1 to stage it.</p></body>");
        }
    }

    private async void OnStamp(object sender, RoutedEventArgs e) =>
        await BridgeAsync("stamp");

    private async void OnHalt(object sender, RoutedEventArgs e) =>
        await BridgeAsync("halt");

    private async Task BridgeAsync(string op)
    {
        await _ready;
        if (DeskView.CoreWebView2 is not null)
        {
            // Same event the macOS shell dispatches (DeskViews.swift bridge()).
            await DeskView.CoreWebView2.ExecuteScriptAsync(
                $"window.dispatchEvent(new CustomEvent('frisky-native',{{detail:{{op:'{op}'}}}}))");
        }
    }
}
