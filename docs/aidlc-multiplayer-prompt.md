# AI-DLC Inception Prompt — Emmabug's Candy Kingdom: Tiny Multiplayer

> **Decision (2026-07-04):** Built directly in v6.0 without running an AI-DLC cycle —
> the ceremony wasn't worth it for a one-file hobby game; this doc served as the
> requirements capture. Transport chosen by Chris: **PeerJS/WebRTC star topology**
> (host relays state, PeerJS public cloud for signaling, no accounts, no backend).
> Known trade-off: strict-NAT/CGNAT networks may fail to connect; the game degrades
> kindly to solo. All constraints below were implemented (5-player cap, preset candy
> names, private 4-char codes, emoji-only reactions, shared room candy, solo-first).

---

## Business Intent

Add very simple real-time multiplayer to an existing single-player browser game so a
6-year-old can play alongside 4–5 invited family members (cousins, grandparents) over
the internet. Players see each other's characters running and jumping in the same
level. That's it — shared presence is the product, not competition.

## Current System Context

- **App**: Emmabug's Candy Kingdom — a 2D canvas side-scroller for a 6-year-old.
  One self-contained `index.html` (~900 lines vanilla JS, no framework, no build step,
  no dependencies). Canvas rendering, Web Audio sfx, touch + keyboard controls.
- **Hosting**: Static files on GitHub Pages (`chris-pecor.github.io/emmabug-world/candy/`),
  PWA with a service worker for offline play. There is **no backend of any kind** today.
- **Game model**: Deterministic levels built from a seeded RNG (all clients can build
  identical levels from a seed). Player state is tiny: `x, y, vx, vy, face, onGround`.
  Collectibles (chocolates), friendly NPCs (gummy bears), and a math-puzzle door at the
  end of each level. No fail states anywhere — falling bounces you back, wrong puzzle
  answers just get encouragement.

## Constraints (non-negotiable)

1. **Child safety first.** Primary user is 6. No accounts, no public matchmaking, no
   free-text chat, no usernames typed by children (pick from a preset list of candy
   names), no voice. Social interaction limited to preset emoji reactions (💗 🎉 👋).
   Rooms are private and reachable only by invite link / 4-character room code.
2. **Max 5 players per room.** Hard cap. Reject the 6th join gracefully and kindly.
3. **Minimal cost & ops.** Target free tier or near-zero monthly cost. Prefer one small
   managed component over anything requiring patching, scaling, or a database. Static
   client stays on GitHub Pages.
4. **Solo play must keep working** exactly as today, including offline/PWA. Multiplayer
   is additive — if the connection drops, the game continues solo without interruption.
5. **Keep the no-fail, cooperative spirit.** No PvP, no scores comparing players.
   Shared candy count for the room is fine (cooperation), rankings are not.
6. **Simplicity over robustness.** 4–5 trusted family members, not the public internet.
   Naive interpolation, last-write-wins, and occasional glitches are acceptable.
   Anti-cheat is explicitly out of scope.

## Non-goals

Persistence, leaderboards, authentication, matchmaking, spectator mode, more than one
concurrent room per deployment being heavily used, native apps.

## Decisions to elaborate (present options with trade-offs, then recommend)

- **Transport/topology**: managed WebSocket relay (e.g., API Gateway WebSocket + Lambda,
  or a tiny Fly.io/Railway node) vs. WebRTC mesh with a minimal signaling service vs.
  an off-the-shelf realtime service free tier (Ably/PartyKit/Supabase Realtime).
  Judge on: cost at ~5 concurrent users, ops burden, latency tolerance (this game is
  presence, not twitch PvP — 100–200 ms is fine), and CORS/hosting fit with GitHub Pages.
- **State model**: each client simulates its own princess and broadcasts position at
  ~10 Hz; remote players are rendered with simple interpolation. Level seed and puzzle
  answers come from the room host. Validate this or propose simpler.
- **Room lifecycle**: who creates the room, how the code/link is shared, what happens
  when the host leaves, idle-room teardown.

## Requested Inception Outputs

1. Refined intent statement with acceptance criteria a parent can verify by playing
   with two phones.
2. Architecture decision record (one page) for the transport choice.
3. Decomposition into **units of work**, each independently shippable and demoable,
   ordered so every increment is playable. Suggested seams:
   - U1: Room service — create/join/leave a room, 5-player cap, heartbeat/timeout.
   - U2: Client netcode — connect, send/receive player state, graceful offline fallback.
   - U3: Remote player rendering — draw up to 4 friend-princesses (distinct hair/dress
     palettes), name tags with preset candy names, interpolation.
   - U4: Shared world feel — synced level seed, shared room candy counter, emoji
     reactions, join/leave sparkle effects.
   - U5: Invite flow — room code entry UI sized for small hands, share-link generation,
     and the kind rejection screen when a room is full.
4. Per unit: acceptance criteria, test approach (including how to test with 2 browser
   tabs locally), and estimated blast radius on the existing single-player code.
5. Risk register — top 5 only, each with a mitigation (e.g., "GitHub Pages is HTTPS,
   so the realtime endpoint must be WSS with a valid cert").
