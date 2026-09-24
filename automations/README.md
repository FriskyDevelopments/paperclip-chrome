# Whop → seat key fulfillment

Pay on Whop, get a `FRSKY-PC-XXXX-XXXX` seat key by email, paste it in
Options — that's the whole pipeline. No accounts, no license server.

## What it does

`automations/whop-seat-fulfillment.json` is an n8n workflow:

1. **Whop payment webhook** (`POST /whop-payment`) — responds `ok` immediately,
   then continues down the wire.
2. **IF payment.succeeded** — only paid events proceed.
3. **Generate seat key** — `FRSKY-PC-XXXX-XXXX` from crypto-random bytes,
   uppercase alnum, ambiguous chars (`0/O/1/I`) excluded.
4. **Resend seat email** — HTTP POST to `https://api.resend.com/emails`
   (Resend has no native n8n node, so plain HTTP). Auth is
   `Bearer $env.RESEND_API_KEY`; sender is `$env.RESEND_FROM`.
5. **Done (log)** — terminal NoOp so the run is greppable.


## Make.com mirror (`make-seat-fulfillment.json`)

Same pipeline, native Make scenario (validated `valid:true` via the Make MCP):

1. **Custom Webhook** (`whop-seat-fulfillment`) — Whop POSTs the payment event.
2. **Webhook Response** — `200 ok` immediately so Whop never times out.
3. **HTTP → Resend** — `POST https://api.resend.com/emails` with the seat key
   generated inline in the payload mapping (`FRSKY-PC-XXXX-XXXX`, uppercase
   hex-style segments derived per-execution — note: Make expressions can't do
   crypto-random without a helper, so uniqueness rests on the webhook payload
   hash + timestamp; see the n8n honest-random note below).

Auth header: `Authorization: Bearer {{process.env.RESEND_API_KEY}}` — wire this
to a Make **environment variable** (Scenarios > Variables) or a Token-type
connection, never hardcode the key. `RESEND_FROM` = `seats@friskydev.com`
(lives in the body mapping; change it there if the sender changes).

### Deploy
- Option A (API): `MAKE_API_KEY` in env, then deploy the validated blueprint
  from `automations/make-seat-fulfillment.json` via the Make MCP
  `create_scenario` (needs a team + folder target from your Make org).
- Option B (UI): Scenarios → Import blueprint → paste the JSON → set the two
  variables → activate → copy the webhook URL into Whop dashboard webhooks.

### Honest deltas vs the n8n flow
- No `IF paid` gate in the blueprint: Router **filters can't be set via the
  Make API** — add the paid-only filter on the Resend route in the Make UI
  after import (condition on the webhook payload's status field).
- Seat randomness is weaker than n8n's crypto node (expression-hash based).
  For paid seats that matter, prefer the n8n flow, or add a Make **Tools >
  Basic trigger / custom JS** step later. Keys stay format-valid either way,
  which is all the extension checks client-side today.

## Setup

1. **Resend first.** Verify `friskydev.com` in Resend (SPF/DKIM), create an API
   key, set the sender to `seats@friskydev.com` (or whatever `RESEND_FROM` holds).
2. **n8n import.** Workflows → Import from file → pick
   `whop-seat-fulfillment.json`. Add the env vars from `.env.example`
   (n8n Cloud: project variables / `.env`). Activate the workflow and copy the
   production webhook URL.
3. **Whop dashboard.** Settings → Webhooks → add the n8n production URL,
   subscribe to payment events. Save the signing secret into
   `WHOP_WEBHOOK_SECRET`. (This template accepts the event and checks the paid
   flag; if you enforce signature verification, add a Code/HMAC step before
   the IF node.)
4. **Test with Whop test mode.** Run a test checkout → watch the n8n execution
   → confirm the Resend email renders the key in mono with the Options how-to.

## Key format

`FRSKY-PC-XXXX-XXXX` — each `X` is `[A-HJ-NP-Z2-9]`.
The extension validates this format client-side only (`SEAT_RE` in
`sidepanel.js`); a mistyped key is rejected before any run starts.

## Server-side verification (follow-up, not this round)

Client-side regex proves shape, not ownership. When ready: keep a seat-key
table (key → email → revoked flag) written by this workflow, add a tiny verify
endpoint, and have the panel check revocation there. Until then, keys are
honor-system plus obscurity — document it as such.

## When email bounces

- Resend dashboard → Logs shows the bounce reason. Hard bounce on a typo'd
  address: find the Whop order email, correct it, re-run the n8n execution
  with the fixed address (or re-fire from Whop → resend webhook).
- Soft bounce / throttled: Resend retries automatically; check the execution
  log for the Resend message id first so you don't double-issue keys.
- Lost keys: the buyer replies to the seat email; issue manually with the
  same generator snippet and log it against the Whop order id.
