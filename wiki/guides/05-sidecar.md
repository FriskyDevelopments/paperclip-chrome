The desk reads pages three ways, best first, and never complains when one
is missing.

## The ladder

1. **Clip sidecar** — a tiny HTTP server on your own machine at
   `http://127.0.0.1:7429`. Fuller page snapshots, structured content, the
   good stuff.
2. **Native host** — `com.friskydev.paperclip`, Chrome native messaging when
   the sidecar isn't running.
3. **read_tab** — the built-in fallback. Visible tab text, no helpers needed.

Point the desk at the sidecar endpoint in Options. If it answers, you get the
rich path. If it doesn't, the desk steps down the ladder silently and keeps
working. Graceful degrade isn't a feature here — it's the architecture.

## Why local

Snapshot traffic never leaves your machine. The sidecar lives on localhost,
the native host speaks through Chrome's own pipes, and page content goes to
exactly one remote place: your mind's API, on a run you started. There is no
middlebox, no relay, no "free snapshot cloud." Your pages stay yours.
