# winget manifests — FR!sky Paperclip Desk

Three manifests per the [winget-pkgs schema](https://github.com/microsoft/winget-pkgs):
version (`FriskyDevelopments.PaperclipDesk.yaml`), installer
(`.installer.yaml`), default locale (`.locale.en-US.yaml`).
`PackageIdentifier: FriskyDevelopments.PaperclipDesk`,
Publisher `Frisky Developments LLC`, Moniker `paperclip-desk`.

## Status: STAGED, not submittable yet

Two things are missing, both gated on the first signed MSIX (paperclip-win):

1. **The real `InstallerSha256`.** The `.installer.yaml` ships the placeholder
   `000…0` (64 zeros). winget validates the hash — a PR with the placeholder
   will be rejected, by design.
2. **A live `InstallerUrl` + `ReleaseNotesUrl`.** Both point at the
   `v0.4.0` GitHub release, which does not exist yet.

## How to finish (on paperclip-win, after the Store packaging step)

```powershell
# 1. Download the exact .msix you will attach to the GitHub release:
Get-FileHash .\PaperclipDesk.msix -Algorithm SHA256
# 2. Paste the hash into FriskyDevelopments.PaperclipDesk.installer.yaml
#    (replace the 64-zero placeholder, keep the quotes).
# 3. Publish the v0.4.0 GitHub release with PaperclipDesk.msix attached
#    under that exact asset name; confirm both URLs resolve.
# 4. Validate locally: winget validate --manifest <folder>
#    (needs the WinGet client on the Windows machine).
# 5. Open the PR to microsoft/winget-pkgs — ONLY after steps 1–4 are green.
```

Until then, the supported install paths are `windows/install.ps1`
(sideload) and the Microsoft Store (`store/msstore-submission.md`).
