// FR!sky Paperclip Desk — application entry point (WinUI 3 / Windows App SDK).
using Microsoft.UI.Xaml;

namespace PaperclipDesk;

public partial class App : Application
{
    private Window? _window;

    public App()
    {
        InitializeComponent();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _window = new MainWindow();
        _window.Activate();
    }
}
