# Conversation Topic Picker

A fun web app for picking conversation topics through a spin wheel, with filters and optional custom topic sources.

## Live app

Use the hosted version: [`https://huddly-saysomething.vercel.app/`](https://huddly-saysomething.vercel.app/)

## How to use

1. Open the app and look at the controls in **Game settings**.
2. Either simply start by spinning the wheel, or by selecting some filters for topics.
   - **Safe mode** (avoids topics that might include brand-names, politics, or other sensitive information)
   - **Depth level** (Small talk / Personal / Meaningful)
   - **Tags** (optional)
3. (Optional) Add custom topics:
   - Click **Import topics**
   - Choose a `.json` / `.txt` file, or paste topics into the textbox and click **Save**
   - Use **Clear** to remove pasted topics
4. Click **Spin the wheel** to reveal the next topic.
5. Click **Spin again** to keep going, and **Reset game** to start a fresh round.

## Import formats

The importer supports both **JSON** and **TXT**.

### JSON

You can import any of the following:

- An array of strings
- An array of topic objects
- An object with a `topics` array

Topic object fields:

- `id` (optional)
- `text` (required)
- `tags` (optional; defaults to `["custom"]`)
- `depthLevel` (`1 | 2 | 3`; optional; defaults to `1`)
- `safetyLevel` (`"safe" | "normal"`; optional; defaults to `"safe"`)

### TXT

- One topic per non-empty line.

## Tech overview (how it works)

This is a client-side Next.js app (React + TypeScript). Key pieces:

- `src/data/topics.ts`: default topic dataset and types.
- `src/lib/filterTopics.ts`: safe mode / depth / tag filtering helpers.
- `src/lib/buildWheelTopicList.ts`: selects a slice set for the wheel based on tags and ensures a diverse set of topics.
- `src/components/games/spin-wheel/*`: SVG wheel rendering and spin rotation math.
- `src/store/useTopicStore.ts`: Zustand store for UI state (safe mode, selected tags, last topic, history, etc.).
- `src/app/page.tsx`: the import modal + paste parsing + wiring the selected topic into the active mini-game.

Custom topic sources (imported file and saved pasted topics) are parsed and merged in the browser, then persisted in `localStorage` so your setup survives refresh.

## Notes

- When a round is active, filter controls are locked until reset.
- If no topics match current filters, the UI offers quick-fix actions (enable more depth, clear tags, turn off safe mode).