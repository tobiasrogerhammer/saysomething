# Conversation Topic Picker

A colorful mini-game web app for revealing random conversation prompts with configurable safety and depth filters.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```txt
src/
  app/
  components/
    games/
    ui/
  data/
    topics.ts
  lib/
    filterTopics.ts
  store/
    useTopicStore.ts
```

## How it works

- `src/data/topics.ts`: Topic model and 60+ topic entries.
- `src/lib/filterTopics.ts`: Safe mode, duration, and depth filtering plus random helper utilities.
- `src/store/useTopicStore.ts`: Zustand global state for filters, selected mini-game, seen IDs, latest topic, and history.
- `src/components/games/*`: Isolated mini-game components implementing the same `MiniGameProps` interface.
- `src/app/page.tsx`: Main UI, filters, game selector, reveal card, clipboard action, and topic history drawer.

## Add a new mini-game

1. Create a new component in `src/components/games/`.
2. Implement the shared game contract from `src/components/games/types.ts`:
   - `topics: Topic[]`
   - `onResult: (topic: Topic) => void`
3. Add it to `GameHost` in `src/components/games/GameHost.tsx`.
4. Register its key/label in `src/store/useTopicStore.ts` and in the selector mapping in `src/app/page.tsx`.

## Add new topics safely

In `src/data/topics.ts`, each topic must include:

- `id`: unique string
- `text`: prompt shown to the user
- `tags`: array of topic tags (`light`, `deep`, `personal`, `creative`, `reflective`, `political`, `commercial`, `sensitive`)
- `duration`: `short | medium | long`
- `depthLevel`: `1 | 2 | 3`

Safe mode is enabled by default and hides topics tagged with `political`, `commercial`, or `sensitive`.

For contributor details, see `CONTRIBUTING.md`.
