"use client";

import { create } from "zustand";
import type { Topic } from "@/data/topics";
import type { SuggestionTag } from "@/lib/filterTopics";

export const gameKeys = [
  "spin-wheel",
  "slot-machine",
  "fish-tank",
  "hot-potato",
  "mystery-envelope",
] as const;

export type GameKey = (typeof gameKeys)[number];

type TopicStore = {
  safeMode: boolean;
  depthLevel: 1 | 2 | 3;
  suggestionTags: SuggestionTag[];
  selectedGame: GameKey;
  /** When set, mini-games draw only this custom topic (still shown in Game mode menu). */
  focusedPersonalTopicId: string | null;
  seenTopicIds: string[];
  lastTopic: Topic | null;
  history: Topic[];
  setSafeMode: (value: boolean) => void;
  setDepthLevel: (value: 1 | 2 | 3) => void;
  toggleSuggestionTag: (value: SuggestionTag) => void;
  clearSuggestionTags: () => void;
  setSelectedGame: (value: GameKey) => void;
  setFocusedPersonalTopicId: (value: string | null) => void;
  recordTopic: (topic: Topic) => void;
  clearSeenTopicIds: () => void;
  clearLastTopic: () => void;
};

export const useTopicStore = create<TopicStore>((set) => ({
  safeMode: true,
  depthLevel: 1,
  suggestionTags: [],
  selectedGame: "spin-wheel",
  focusedPersonalTopicId: null,
  seenTopicIds: [],
  lastTopic: null,
  history: [],
  setSafeMode: (value) => set({ safeMode: value }),
  setDepthLevel: (value) => set({ depthLevel: value }),
  toggleSuggestionTag: (value) =>
    set((state) => ({
      suggestionTags: state.suggestionTags.includes(value)
        ? state.suggestionTags.filter((tag) => tag !== value)
        : [...state.suggestionTags, value],
    })),
  clearSuggestionTags: () => set({ suggestionTags: [] }),
  setSelectedGame: (value) => set({ selectedGame: value, focusedPersonalTopicId: null }),
  setFocusedPersonalTopicId: (value) => set({ focusedPersonalTopicId: value }),
  clearSeenTopicIds: () => set({ seenTopicIds: [] }),
  clearLastTopic: () => set({ lastTopic: null }),
  recordTopic: (topic) =>
    set((state) => {
      const nextSeenIds = state.seenTopicIds.includes(topic.id)
        ? state.seenTopicIds
        : [...state.seenTopicIds, topic.id];

      const nextHistory = [topic, ...state.history.filter((entry) => entry.id !== topic.id)].slice(0, 10);

      return {
        seenTopicIds: nextSeenIds,
        lastTopic: topic,
        history: nextHistory,
      };
    }),
}));
