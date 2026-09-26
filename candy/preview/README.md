# Candy Kingdom

The complete revamp runs at **http://localhost:4173/candy/**. From the repository root:

```sh
python3 -m http.server 4173
```

No build step is needed. The original game is preserved at `/candy/classic.html`;
`/candy/preview/` runs the new game with separate adventure progress.

## Play

Use arrows or A/D to move and Space, Up, or W to jump. Jump again for a double
jump. Phones have simultaneous movement and jump buttons. Escape pauses; leaving
the tab clears held controls and pauses. Sound starts muted.

- Four extended adventures: Candy Meadow, Berry Starlight, Chocolate River, Rainbow Peaks.
  Courses span 7,310–9,220 world units, with extra island crossings, moving
  bridges, climbing routes, and treasures throughout the later chapters.
- Fixed-step physics, buffered jumps, edge grace, moving platforms, gumdrop springs,
  and safe recovery after falls. Each castle is reachable without a pet power.
- Candy Meadow has a short bunny story before the long castle route: peek at
  Pip, pick a carrot for Peaches, sing to Moon, then bring all three to the
  bunny cottage. Pawprints, illustrated buttons, and short words guide play;
  tap the action button or press E when nearby. The picture checklist has clues.
- Rescued bunnies follow Emma's jumps. Bringing everyone home starts a parade
  and adds the family to My room. Snack, Play, and Sleep have pictures and short
  responses; choices save automatically, with no timers or care penalties.
  The room opens in Play view; Decorate opens the furniture tools.
- Three untimed bubble-wish trails per adventure: jump through all five bubbles
  for bonus sweets, eight seconds of rainbow magnet magic, and a balloon party.
- Layered cottages, ribbon arches, sugar-crystal platforms, and drifting
  pollen/fireflies; scenery continues throughout the extended courses.
- Treats, three stars per adventure, gems, chests, rainbow magnets, helpful gummy
  bears, and grumps that give a gentle bounce. Side contact does not hurt.
- Eight pets: Kitty attracts treats, Bunny jumps higher, Pengy runs faster,
  Flutter glides, Draggy grants three jumps, Sparkle boosts lollipops, Puppy
  points toward stars, and Shelly makes bear goals easier.
- Nine freely available outfits, drawn portraits, and saved pet/outfit choices.
- Encouraging counting doors with retry and a magic skip; separate bests and
  completion for each adventure.
- A room with 14 furniture types, four wallpapers, placement, dragging, arrow-key
  nudges, removal, undo, and automatic saving.
- A land builder with seven sticker types, scrolling, editing, saved layouts,
  immediate play, and family sharing. Custom runs do not overwrite adventure bests.
- Private family codes/invite links for up to five people, shared sweets, preset
  names and reactions, smooth remote characters, and shared homemade lands.
- Save-a-picture button and offline solo play after an initial online visit.

On another device, use the computer's reachable network address instead of
`localhost`. Offline installation requires localhost or HTTPS. Family play needs
internet access and compatible WebRTC connectivity. It uses bundled MIT-licensed
PeerJS 1.5.4 and its public signaling service; no paid service, account, or paid
asset was added. There is no paid TURN relay; some restricted networks may prevent
joining. Connection failure leaves solo play available.

## Saves and migration

The main route copies the original `emmabug-candy-progress` value exactly to
`emmabug-candy-legacy-backup` before a one-time import. It leaves the original key
untouched. Room and land layouts are imported; the full legacy inventory, eggs,
and pet data are archived in the creative save. All revamped pets, outfits, and
furniture are available immediately. The classic route remains available for the
original game's additional systems.

New adventure progress uses `emmabug-candy-revamp-v1`; preview adventure progress
uses `emmabug-candy-preview-v1`. Room and builder data share
`emmabug-candy-creative-v1`. Saves belong to the current browser and origin;
clearing site data removes them. The service worker also keeps Unicorn World,
Sea World, and classic Candy Kingdom available offline.

## Source map

- `levels.mjs`, `physics.mjs`: authored courses and fixed 120 Hz simulation.
- `adventure.mjs`, `puzzles.mjs`, `progress.mjs`: powers, rewards, counting, saves.
- `art.mjs`, `furniture.mjs`: original Canvas/SVG artwork.
- `creative.mjs`, `workshop.mjs`: sanitized layouts, room and builder editing.
- `family.mjs`, `family-ui.mjs`: private WebRTC sessions and family controls.
- `migration.mjs`: one-time save import and original-data backup.
- `game.mjs`, `index.html`, `style.css`: integration, controls, responsive interface.
- `vendor/`: pinned PeerJS bundle and license; loaded only for family play.
- `../../sw.js`: offline cache and cache upgrade.

## Validation — September 7, 2026

```sh
node candy/preview/physics.test.mjs
node candy/preview/adventure.test.mjs
node candy/preview/levels.test.mjs
node candy/preview/release.test.mjs
node candy/preview/rescue.test.mjs
```

All 39 checks pass. Coverage includes frame-rate independence, jump timing,
platform carry, safe recovery, reward uniqueness, pet effects, reachable castles
and stars, per-world saves, counting doors, layout limits, migration idempotence,
exact legacy backup, five-player admission, rewards/reactions/land relay, and
connection cancellation.

Playwright Chromium checks cover desktop and emulated phone controls, all four
adventures, room placement/dragging/undo/persistence, builder/play, migration,
offline reloads of all three games and classic Candy Kingdom, and absence of page
runtime errors. Upgrading from the old service worker preserves the exact legacy
backup and unrelated caches; offline relaunch and repeated keyboard nudges pass. Real WebRTC with a local signaling server connected five browser
contexts, rejected a sixth, shared sweets/reactions/lands, and returned guests to
solo play after the host left. The local browser needed mDNS host-candidate hiding
disabled for this test.

Public-internet NAT traversal and physical devices have not been tested. Emma's
playtest remains useful for comfort and readability. GitHub Pages publishes the `main` branch at
https://chris-pecor.github.io/emmabug-world/candy/. Screenshots are in `../../docs/`.

## Bunny story checks — September 26, 2026

The rescue tests cover distinct interactions, the carrot prerequisite, nearby
platform access, one-time home completion, follower paths, custom-land isolation,
and save validation. Chromium playthroughs completed all three rescues and the
home celebration with keyboard and emulated phone touch input. Snack, Play,
Sleep, reload persistence, and furniture undo passed without runtime errors.
The phone check used reduced motion. Screenshots: `../../docs/candy-bunny-home-phone.png`
and `../../docs/candy-bunny-clues-phone.png`.
