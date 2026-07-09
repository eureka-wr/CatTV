# Cat TV: Fishing Pond

First MVP game for a Cat TV / Cat Game app. Fishing Pond is a touch-first
React + Canvas prototype for tablet and phone screens.

## What is included

- Setup screen for cat age, cat personality, and timer.
- Reusable difficulty configuration for fish count, speed, size, hiding, jumps,
  reaction distance, and sound intensity.
- Fullscreen animated pond with fish, plants, rocks, lily pads, bubbles, and
  ripples.
- Touch interaction: near-fish touches trigger escape motion, splash ripple,
  gentle sound, and internal catch tracking.
- Pause, stop, reset/replay, and session summary.

## Run locally

This workspace uses the bundled Codex runtime if system Node is unavailable:

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  /Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dev --host 127.0.0.1
```

Then open `http://127.0.0.1:5173/`.

## Verify

```bash
PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  /Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm build

PATH="/Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  /Users/eureka6/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm lint
```
