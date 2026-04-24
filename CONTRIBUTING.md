# Contributing

## Add a mini-game

Every mini-game must implement the shared interface in `src/components/games/types.ts`:

```ts
interface MiniGameProps {
  topics: Topic[];
  onResult: (topic: Topic) => void;
}
```

Guidelines:

1. Create a new file in `src/components/games/` (one game per file).
2. Keep game logic isolated in that component.
3. Use CSS keyframes only for animations (no animation libraries).
4. Call `onResult(topic)` once the game resolves.
5. Register the game in:
   - `src/components/games/GameHost.tsx`
   - `src/store/useTopicStore.ts` (`gameKeys`)
   - `src/app/page.tsx` (`gameLabels` selector mapping)

## Add or edit topics

Topics live in `src/data/topics.ts`.

```ts
type Topic = {
  id: string;
  text: string;
  tags: TopicTag[];
  duration: "short" | "medium" | "long";
  depthLevel: 1 | 2 | 3;
};
```

Tagging rules:

- Use `political`, `commercial`, and `sensitive` only when truly relevant.
- Safe mode excludes topics with any of those three tags.
- Prefer neutral, brand-free prompts by default.

Quality checklist:

- Keep IDs unique.
- Keep topic text concise and clear.
- Balance depth and duration categories over time.
