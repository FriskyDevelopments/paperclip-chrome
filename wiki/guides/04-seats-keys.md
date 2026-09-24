# SEATS & KEYS

One purchase, one key, one email. No accounts, no license server.

## The format

`FRSKY-PC-XXXX-XXXX` — each `X` drawn from `[A-HJ-NP-Z2-9]`, ambiguous
characters (`0/O/1/I`) excluded so a key read off a phone screen still types
clean. The desk validates the shape client-side before any run starts; a
mistyped key is rejected at the door.

## The flow

Pay on Whop → the fulfillment automation mints your key → it lands in your
inbox via Resend → paste it into the desk's Options. That's the whole
pipeline. The automation is a small n8n workflow: Whop payment webhook,
paid-check, key generator, seat email, done.

## The honest footnote

Client-side shape validation proves format, not ownership. Until a verify
endpoint exists, keys run on honor plus obscurity — the automation README
says so outright. Lost your key? Reply to the seat email and a replacement
is issued against the original order.

Launch pricing: $19 on Whop ($29 after), already included in the $49 kit.
