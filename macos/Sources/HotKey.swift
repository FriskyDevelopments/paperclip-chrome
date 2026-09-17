import Carbon

/// Global hotkey via Carbon RegisterEventHotKey — works system-wide and is
/// sandbox-safe (no accessibility or input-monitoring entitlement needed).
final class GlobalHotKey {
    private var hotKeyRef: EventHotKeyRef?
    private var handlerRef: EventHandlerRef?
    private let action: () -> Void

    init(keyCode: UInt32, modifiers: UInt32, action: @escaping () -> Void) {
        self.action = action
        var spec = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: UInt32(kEventHotKeyPressed)
        )
        let userData = Unmanaged.passUnretained(self).toOpaque()
        // Carbon dispatches on the main run loop, so calling the action
        // directly is safe.
        let callback: EventHandlerUPP = { _, _, userData in
            guard let userData else { return noErr }
            Unmanaged<GlobalHotKey>.fromOpaque(userData).takeUnretainedValue().action()
            return noErr
        }
        InstallEventHandler(GetApplicationEventTarget(), callback, 1, &spec, userData, &handlerRef)
        let hotKeyID = EventHotKeyID(signature: OSType(0x46524953) /* 'FRIS' */, id: 1)
        RegisterEventHotKey(keyCode, modifiers, hotKeyID, GetApplicationEventTarget(), 0, &hotKeyRef)
    }

    deinit {
        if let hotKeyRef { UnregisterEventHotKey(hotKeyRef) }
        if let handlerRef { RemoveEventHandler(handlerRef) }
    }
}
