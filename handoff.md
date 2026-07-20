# Cat TV Handoff

This document is for a new Codex session with no prior context. It summarizes
what this project is, what has been completed, where things currently stand,
and what to avoid repeating.

## Project Summary

Cat TV is a React + Canvas web app for supervised cat play on a tablet, phone,
or browser. The app shows animal targets that cats can watch, track, and hold
still with their paws.

Public site:

```text
https://game.cattv.space
```

GitHub remote:

```text
git@github.com:eureka-wr/CatTV.git
```

Deployment is already connected from GitHub to Vercel. Pushing to `main`
updates the public site automatically.

## Current Status

The core product goal is complete for this phase.

The project currently has:

- A 12-game animal training suite.
- A visual lobby with large animal icons.
- Full-screen Canvas games with animal-specific scenes and movement.
- Paw-friendly corner controls.
- Infinite hold-to-stop/release-to-run behavior for all games.
- Bilingual UI copy infrastructure.
- README with project explanation and screenshots.
- Social promo images and promo videos.
- Public Vercel deployment on `game.cattv.space`.

The publishing branch for the realistic-animal work is
`agent/realistic-mouse-gecko-games`. Its baseline was:

```text
2465640 Add project handoff document
```

The realistic-mouse and realistic-gecko work described below is included on
that branch and is intended to reach `main` through review/merge.

## Realistic Mouse Prototype (2026-07-18)

The mouse game is now the first working realism experiment. It uses the shared
Canvas engine and preserves the existing large corner controls.

Implemented behavior:

- A photorealistic, low ground-level meadow background with one central burrow.
- A short natural cue: stems and loose soil move while the mouse is still hidden.
- A separate emergence phase in which the mouse grows out from the hole instead
  of fading into existence.
- The mouse now chooses horizontal, vertical, and diagonal routes inside an
  expanded ground band, rather than repeating only left/right runs.
- Eight screen-space direction sectors select one of three realistic viewpoints:
  side, running away, or running toward the camera. Diagonal routes apply only a
  restrained rotation to the matching away/toward view.
- Perspective scaling makes the mouse slightly smaller higher in the meadow and
  slightly larger near the bottom, while all route endpoints remain in bounds.
- Every eight-frame direction sheet advances from distance travelled rather
  than elapsed time, reducing foot sliding when speed changes.
- A brief natural mid-run sniff/alert pause makes the motion less mechanical;
  pressing and holding remains the separate, indefinite cat-controlled freeze.
- Holding freezes the mouse at its current position without pulling it toward
  the pointer. Releasing resumes the same route from the same position.
- The mouse never exits the viewport; it chooses another in-screen route at each
  edge and can be held and released repeatedly.
- The mouse branch has no synthetic splash sound, yellow reward glow, wrong-tap
  white ring, black miss overlay, or release disappearance.

Main implementation:

```text
src/components/GameCanvas.tsx
src/game/infiniteMotion.ts
src/game/infiniteMotion.test.ts
src/game/mouseMotion.ts
src/game/mouseMotion.test.ts
```

Runtime assets:

```text
public/game-assets/mouse/meadow-burrow-bg.webp
public/game-assets/mouse/mouse-run-side-stable-v2-sheet.png
public/game-assets/mouse/mouse-run-away-sheet.png
public/game-assets/mouse/mouse-run-toward-sheet.png
```

Design notes and source concepts:

```text
docs/realistic-mouse-plan.md
docs/concepts/realistic-mouse-v1.png
docs/concepts/realistic-mouse-v2.png
docs/concepts/realistic-mouse-v3-burrow.png
docs/concepts/realistic-mouse-clean-bg-v1.png
docs/screenshots/realistic-mouse-game.png
```

The current meadow/burrow image is intentionally a functional prototype. Its
soil and burrow rim still have some repeated AI-generated texture, so the next
visual pass should replace or retouch the background before calling it a final
production asset. The three eight-frame direction sheets are usable and
consistent enough for interaction testing; real video-derived or rigged 12–16
frame cycles would be the higher-fidelity production upgrade.

The side-view sheet was regenerated after visual testing found that the first
version rocked fore/aft unnaturally. The replacement locks the torso center and
ground baseline across all eight frames so Canvas translation, rather than
within-frame drift, supplies the mouse's forward movement.

## Realistic Gecko Update (2026-07-19)

The gecko game is the second realism pass and follows the same infinite
hold-to-freeze/release-to-resume interaction as the mouse.

Implemented behavior:

- A photorealistic, warm ivory plaster wall replaces the old green grid wall.
- A top-down eight-frame house-gecko crawl sheet replaces the synthetic Canvas
  crawler. The torso centroid is registered to the same point in every frame.
- The sprite rotates along the live tangent of its curved route, so the gecko
  can crawl up, down, left, right, and diagonally without appearing to slide
  sideways.
- The old whole-body crawl wobble is disabled for the gecko; alternating limbs
  and restrained tail/spine articulation now supply the visible motion.
- Frame changes come from distance travelled rather than elapsed time. Holding
  therefore freezes both position and pose, while release continues from the
  same location and crawl cycle.
- Path duration is deliberately slow (7–14 seconds), and every new destination
  remains inside the wall's safe movement bounds.
- The realistic gecko suppresses synthetic catch ripples, miss overlays, and
  the old yellow wall cue.

Main implementation:

```text
src/components/GameCanvas.tsx
src/game/geckoMotion.ts
src/game/geckoMotion.test.ts
src/game/infiniteMotion.ts
```

Runtime assets:

```text
public/game-assets/gecko/ivory-plaster-wall-bg.webp
public/game-assets/gecko/gecko-crawl-top-sheet.png
```

## Important Files

Main app and game logic:

```text
src/App.tsx
src/components/GameLobby.tsx
src/components/GameCanvas.tsx
src/game/games.ts
src/game/session.ts
src/game/types.ts
src/i18n.ts
src/App.css
```

Game suite order:

```text
src/game/games.ts
```

All 12 games share one engine:

```text
src/components/GameCanvas.tsx
```

Social video generation:

```text
scripts/create_social_ad.py
```

Social assets:

```text
public/social/
public/social/audio/
public/social/cat-posters/
```

Docs:

```text
README.md
docs/screenshots/
handoff.md
```

## Completed Product Work

### Game Experience

The first MVP started as a fish pond game and expanded into a 12-game training
sequence:

1. Fish
2. Mouse
3. Dragonfly
4. Butterfly
5. Bird
6. Cricket
7. Frog
8. Gecko
9. Beetle
10. Snake
11. Squirrel
12. Firefly

Each game now uses the same infinite chase structure:

1. A cue appears.
2. The animal target appears.
3. The target follows curved or species-like paths between safe points inside
   the viewport.
4. Pressing and holding the target freezes it at its current position.
5. Pointer movement does not drag the target.
6. Releasing resumes the same target from the same position and path progress.
7. Reaching a boundary selects another in-screen path instead of escaping or
   starting a new round.

The older hold-and-drag behavior was originally added in:

```text
6d4265a Make targets follow cat paw while held
```

That commit describes historical behavior only. As of 2026-07-18, do not make
the target follow the paw and do not make it disappear on release. The current
rule is "hold to freeze, release to continue, remain in screen forever."

### Navigation

The app no longer has the old setup screen. Sessions default to endless play
and stop only when the owner returns to the lobby. In endless mode, the home
button keeps its deliberate hold-to-stop behavior.

The lobby shows animal icons. The game screen has large corner controls:

- Top-left: Home/lobby
- Top-right: Pause/resume
- Bottom-left: Previous game
- Bottom-right: Next game

These controls were deliberately made large because small dense controls are
bad for cat paws.

As of 2026-07-18, all four controls use one deliberately simple visual system:
a cream cat-paw background, soft pink toe beans and central pad, and dark-plum
functional icons. Do not reintroduce a different pad color for every function.

- Home uses a cat-eared house outline.
- Pause uses two rounded bars; resume replaces them with an outlined play mark.
- Previous and next use thick, rounded directional lines.

All functional icons are shifted down from the geometric center of the button
into the center of the large paw pad. At the 84px narrow-screen size, the icon
center is at 56px and the pad center is at 57.12px (about 1.12px difference).

The paw silhouette is decorative; the actual button remains a large rectangular
touch target (`88–108px` normally and `84px` below the `820px` breakpoint). Do
not reduce those dimensions to match the visible toe shapes. Keyboard focus uses
a paw-shaped glow rather than a circular outline. The implementation is in:

```text
src/components/GameCanvas.tsx
src/App.css
```

### Deployment

The GitHub-to-Vercel deployment is already done and working.

Do not redo the Vercel setup unless the user specifically asks. The user already
corrected this once: the goal is GitHub pushes automatically updating Vercel,
and that is already achieved.

Production domain:

```text
https://game.cattv.space
```

Older domain references to avoid:

```text
https://fish.cattv.space
```

If you see `fish.cattv.space`, update it to `game.cattv.space`.

### README

`README.md` has been updated to explain:

- Project goal
- 12 games
- How the games work
- Navigation
- Safety notes
- Local run commands
- Verification commands
- Deployment URL

Screenshots are in:

```text
docs/screenshots/lobby.png
docs/screenshots/fish-game.png
docs/screenshots/firefly-game.png
```

### Social Promo Assets

Generated cat promo images are in:

```text
public/social/cat-posters/
```

There are 8 finished realistic cat images, not 12. Earlier image generation was
interrupted before reaching 12. The user later chose to continue with the images
that existed.

Current promo videos:

```text
public/social/cat-tv-parent-ad.mp4
public/social/cat-tv-like-you-ad.mp4
```

Public video URLs:

```text
https://game.cattv.space/social/cat-tv-parent-ad.mp4
https://game.cattv.space/social/cat-tv-like-you-ad.mp4
```

`cat-tv-parent-ad.mp4` uses the user-provided "Cat come here" audio.

`cat-tv-like-you-ad.mp4` uses the user-provided "Cat like you" audio.

The video generation script now creates both variants:

```bash
PYTHONPATH=/tmp/cat-tv-video-deps python3 scripts/create_social_ad.py
```

The script expects `imageio`, `imageio-ffmpeg`, Pillow, and NumPy. In this
environment those were installed temporarily under:

```text
/tmp/cat-tv-video-deps
```

If that temp directory disappears, reinstall with the bundled Python:

```bash
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m pip install --quiet --target /tmp/cat-tv-video-deps imageio imageio-ffmpeg
```

## Audio Sources

Audio source files are stored in:

```text
public/social/audio/
```

User-provided current ad audio:

```text
public/social/audio/cat-come-here.m4a
public/social/audio/cat-come-here.wav
public/social/audio/cat-like-you.m4a
public/social/audio/cat-like-you.wav
```

Older Mixkit fallback cat meows are still present:

```text
public/social/audio/domestic-cat-hungry-meow.wav
public/social/audio/little-cat-attention-meow.wav
public/social/audio/sweet-kitty-meow.wav
```

Important: the user disliked synthetic/electronic cat sounds. Do not generate
programmatic sine-wave "meows" again. Use real cat recordings.

## Known Pitfalls

### VPN Environment for Image Generation

The user normally runs this Mac through a VPN and wants image-generation
requests to use that VPN route.

Verified on 2026-07-18:

- macOS had no explicit HTTP/HTTPS system proxy configured.
- No shell proxy environment variables were set.
- The active VPN tunnel interface was `utun5` (`172.16.0.2`).
- Routes to both `chatgpt.com` and `1.1.1.1` used `utun5`.
- A direct HTTPS request reached the ChatGPT/Cloudflare edge through that route.

Before a future image-generation request, check:

```bash
route -n get chatgpt.com
```

The output should show a `utun` interface. The built-in image-generation tool
does not expose a per-request proxy or network-interface override, so use the
system VPN route and do not claim that a specific tool call was forcibly bound
to the tunnel. Two early built-in image-generation attempts on 2026-07-18
returned a backend `network error`, but later requests succeeded while the same
VPN route was active. The final clean background and all three mouse direction
sheets are saved in the project as listed above. Before generating the
away/toward sheets on 2026-07-18, `route -n get chatgpt.com` again reported
`utun5`.

### Use Bundled Runtime Paths

Plain `pnpm run build` may fail if `node` is not on PATH:

```text
node: not found
```

Use the bundled Node path:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run build
```

Same pattern for `lint`, `test`, and `dev`.

### Browser Verification Matters

Build success alone is not enough for frontend changes. A prior related project
had runtime issues that build did not catch. For game interaction changes, run
at least:

```bash
pnpm run build
pnpm run lint
pnpm run test
```

When possible, also do a browser smoke test. A local Vite server usually runs on:

```text
http://localhost:5173/
```

### Avoid Rebuilding Separate Engines

All 12 games intentionally share one Canvas engine in `GameCanvas.tsx`. Do not
fork one component per animal unless there is a strong reason. Add new animal
behavior through:

- `targetStyles`
- `gameProfiles`
- scene drawing helpers
- movement logic in `getMovementPoint`
- target drawing helpers

### Do Not Shrink Cat Controls

The navigation controls were enlarged because the user observed that dense,
small controls were bad for cat paws. Keep controls large and visually obvious.

### Do Not Add Text-Heavy Cat-Facing UI

The lobby can show hover/focus labels for humans, but the game surface itself
should remain visual and icon-first. Cats do not need text instructions.

### Do Not Redo Deployment

The site is already on Vercel through GitHub. If the user asks to publish normal
changes, commit and push to `main`; Vercel handles the rest.

### Domain Change

Current domain is:

```text
game.cattv.space
```

Do not use the old `fish.cattv.space` in README, videos, or scripts.

### Promo Video Details

`scripts/create_social_ad.py` currently renders a 1080x1920 vertical ad. ffmpeg
prints a warning that it resizes to 1088x1920 for macroblock compatibility. This
has been accepted and works on Vercel.

## Common Commands

Install dependencies:

```bash
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm install
```

Run dev server:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm exec vite --host 127.0.0.1
```

Build:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run build
```

Lint:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run lint
```

Test:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run test
```

Regenerate social ads:

```bash
PYTHONPATH=/tmp/cat-tv-video-deps \
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
scripts/create_social_ad.py
```

Check a deployed video:

```bash
curl -I -L https://game.cattv.space/social/cat-tv-parent-ad.mp4
curl -I -L https://game.cattv.space/social/cat-tv-like-you-ad.mp4
```

Commit and push:

```bash
git status --short
ssh -T git@github.com
git push -u origin agent/realistic-mouse-gecko-games
```

## Current Open Questions

The implementation has no active technical blocker. The confirmed repository
and SSH remote are:

```text
https://github.com/eureka-wr/CatTV
git@github.com:eureka-wr/CatTV.git
```

SSH authentication was verified as the `eureka-wr` GitHub account. The local
machine does not require GitHub CLI for branch push operations.

The main product question remains whether real cats track the realistic mouse
and gecko better than the previous abstract versions, and how much animation
exaggeration improves tracking without making either animal look cartoon-like.

The project is in a good stopping state. Reasonable next steps, if the user
wants to continue later:

- Watch cat group feedback on the two promo videos.
- Test the realistic mouse and gecko with 3–5 cats and record notice,
  head-tracking, and paw-attempt rates.
- If the behavior validates, retouch/replace the meadow background and upgrade
  the run cycle to a video-derived or rigged 12–16-frame asset.
- Add more realistic cat promo images if more marketing variants are needed.
- Add more games beyond the current 12-animal set.
- Tune game difficulty if real cats find later games too hard or too easy.
- Add a simple analytics-free feedback page or QR/share page if promotion grows.
- Improve README with links to the two promo videos.

## Last Known Verification

Recent local verification performed after the realistic gecko update:

- `pnpm run build` passed with bundled Node.
- `pnpm run lint` passed.
- `pnpm run test` passed: 4 test files and 23 tests.
- `git diff --check` passed.
- In-app browser testing loaded the realistic gecko game on the generated ivory
  plaster wall with no React/Vite overlay and no console errors.
- Browser screenshots confirmed slow continuous movement across horizontal and
  diagonal routes, live direction rotation, and a complete sprite remaining
  inside the viewport near the right edge.
- A simulated cat-paw drag started on the gecko and ended about 255px away. The
  gecko moved only about 4.5px during the hold and did not follow the paw; after
  release it resumed from the same route and moved again.
- The gecko runtime assets were validated as a 1600×900 WebP background and a
  1600×480 RGBA eight-frame sprite sheet. All sprite corners are transparent,
  and normalized per-frame centroids stay within roughly one pixel.

Recent mouse/navigation verification from the previous pass:

- Browser smoke tests passed in Chrome at 1280×800 and 390×844.
- Background and run-sheet requests loaded successfully with no browser console
  errors or error overlay.
- Cue, emergence, natural mid-run sniff pause, hold/release, repeated turns, and
  responsive crop were exercised.
- Browser samples showed the side, toward-camera, and away-from-camera sheets
  on horizontal, diagonal, and vertical paths; the mouse remained inside the
  meadow safe area and changed size with depth.
- Nine mouse motion samples across multiple route segments kept the complete
  sprite inside the 729×778 browser viewport.
- A dragonfly remained visible and moving immediately after catch/release and
  one second later.
- The cat-paw corner controls passed visual checks at the default 729×778
  viewport and a 390×416 narrow viewport. All narrow controls retained 84×84px
  touch targets inside the viewport.
- After visual feedback, the four colored variants were replaced by one
  cream/pink/plum palette and the icons were aligned to the central paw pad.
- Pause/resume and previous/next navigation were exercised with no browser
  console errors.

Environment notes for the next session:

- The user runs through a VPN and explicitly wants image/network requests to
  use it. `route -n get chatgpt.com` showed interface `utun5` before both the
  mouse and gecko image-generation requests.
- The generated project assets are already copied into `public/game-assets/`;
  do not reference the raw files under `~/.codex/generated_images/` at runtime.
- Gecko chroma-key intermediates and the unused first side-view mouse sheet were
  moved to Trash before publication and are not runtime dependencies.

Earlier deployed/social verification:

- `pnpm run build` passed with bundled Node.
- New promo video URLs returned HTTP 200 from Vercel.
- `cat-tv-like-you-ad.mp4` was verified to include an AAC audio stream.
- `cat-tv-parent-ad.mp4` remained available after adding the second ad.

## Human Preference Notes

The user prefers:

- Shipping practical working versions.
- Keeping the cat-facing UI simple, visual, and paw-friendly.
- Using real testing and public links when available.
- Clean documentation for future sessions.
- Chinese conversation is natural and preferred in this thread.

The user explicitly disliked:

- Overly complex cat game interactions.
- Small dense navigation controls.
- Synthetic/electronic cat sounds for promo videos.
- Repeating already completed deployment work.
