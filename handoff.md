# Cat TV Handoff

This document is for a new Codex session with no prior context. It summarizes
what this project is, what has been completed, where things currently stand,
and what to avoid repeating.

## Project Summary

Cat TV is a React + Canvas web app for supervised cat play on a tablet, phone,
or browser. The app shows simple animal targets that cats can watch, track, tap,
hold, and drag with their paws.

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
- Hold-and-drag catch behavior for all games.
- Bilingual UI copy infrastructure.
- README with project explanation and screenshots.
- Social promo images and promo videos.
- Public Vercel deployment on `game.cattv.space`.

Current branch is `main`. At the time of this handoff, the working tree was
clean after commit:

```text
5993b2f Add like you cat ad video
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

Each game uses the same round structure:

1. A cue appears.
2. The animal target appears.
3. The target moves toward a far edge, often with slight curves or species-like
   motion.
4. If the cat misses, the screen darkens briefly and a new round starts.
5. If the cat catches the target, the target now stays under the paw while the
   pointer is held down.
6. When the paw is released, the target disappears with a reward effect.

The hold-and-drag behavior was added in:

```text
6d4265a Make targets follow cat paw while held
```

This is important: do not revert to instant disappearance on tap. The current
desired behavior is "caught target follows the paw until release."

### Navigation

The app no longer has the old setup screen. Sessions default to 3 minutes.

The lobby shows animal icons. The game screen has large corner controls:

- Top-left: Home/lobby
- Top-right: Pause/resume
- Bottom-left: Previous game
- Bottom-right: Next game

These controls were deliberately made large because small dense controls are
bad for cat paws.

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
/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm run dev -- --host 127.0.0.1
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
git add <files>
git commit -m "<message>"
git push origin main
```

## Current Open Questions

No active blocker at this handoff.

The project is in a good stopping state. Reasonable next steps, if the user
wants to continue later:

- Watch cat group feedback on the two promo videos.
- Add more realistic cat promo images if more marketing variants are needed.
- Add more games beyond the current 12-animal set.
- Tune game difficulty if real cats find later games too hard or too easy.
- Add a simple analytics-free feedback page or QR/share page if promotion grows.
- Improve README with links to the two promo videos.

## Last Known Verification

Recent verification performed during the final social video work:

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

