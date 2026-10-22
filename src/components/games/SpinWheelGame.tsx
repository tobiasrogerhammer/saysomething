"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Topic } from "@/allTopics/topics";
import { buildInitialWheelTopics, mergePersonalTopicsOntoWheel } from "@/lib/buildWheelTopicList";
import { launchSpinConfetti } from "@/lib/launchSpinConfetti";
import type { SuggestionTag } from "@/lib/filterTopics";
import { computeRotationToLandOnIndex, randomSpinDurationMs, sliceIndexUnderPointer } from "@/lib/spinWheelMath";
import { pickNextQuestionText } from "@/lib/wheelQuestions";
import type { SpinWheelSegment } from "./spin-wheel/SpinWheel";
import { SpinWheel } from "./spin-wheel/SpinWheel";
import { WheelControls } from "./spin-wheel/WheelControls";

export type SpinWheelSpinQuestion = {
  text: string;
  topic: Topic;
};

export type SpinWheelGameProps = {
  topicPool: Topic[];
  suggestionTags: SuggestionTag[];
  /** Rendered at the top of the game card (e.g. topic prompt and follow-up question). */
  header?: ReactNode;
  onTopicResult?: (topic: Topic) => void;
  /** Fired when a spin resolves (new question) or when the game is reset (`null`). */
  onSpinQuestionChange?: (question: SpinWheelSpinQuestion | null) => void;
  onGameStarted?: () => void;
  onSessionReset?: () => void;
};

type Phase = "setup" | "spinning" | "redistributing" | "result" | "finished";

function uniformSegments(topics: Topic[]): SpinWheelSegment[] {
  const n = topics.length;
  if (n === 0) return [];
  const step = 360 / n;
  return topics.map((topic, i) => ({
    topic,
    startDeg: i * step,
    endDeg: (i + 1) * step,
  }));
}

function lerpSegments(from: SpinWheelSegment[], to: SpinWheelSegment[], t: number): SpinWheelSegment[] {
  return to.map((toSeg) => {
    const fr = from.find((s) => s.topic.id === toSeg.topic.id);
    if (!fr) return toSeg;
    return {
      topic: toSeg.topic,
      startDeg: fr.startDeg + (toSeg.startDeg - fr.startDeg) * t,
      endDeg: fr.endDeg + (toSeg.endDeg - fr.endDeg) * t,
    };
  });
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function poolKey(pool: Topic[]): string {
  return pool.map((t) => t.id).join("\0");
}

function buildWheelFromPool(topicPool: Topic[], suggestionTags: SuggestionTag[], random: () => number): Topic[] {
  const defaultPool = topicPool.filter((t) => !t.id.startsWith("custom-"));
  const base = buildInitialWheelTopics(defaultPool, suggestionTags, random);
  return mergePersonalTopicsOntoWheel(base, topicPool);
}

export function SpinWheelGame({
  topicPool,
  suggestionTags,
  header,
  onTopicResult,
  onSpinQuestionChange,
  onGameStarted,
  onSessionReset,
}: SpinWheelGameProps) {
  const [wheelTopics, setWheelTopics] = useState<Topic[]>([]);
  const [visualSegments, setVisualSegments] = useState<SpinWheelSegment[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [gameStarted, setGameStarted] = useState(false);
  const [pendingRemovalTopicId, setPendingRemovalTopicId] = useState<string | null>(null);
  const [rotationDeg, setRotationDeg] = useState(0);
  const rotationRef = useRef(0);
  const [transitionMs, setTransitionMs] = useState(4000);
  const [currentQuestion, setCurrentQuestion] = useState<{ topic: Topic; text: string; tagLabel: string } | null>(null);
  const askedByTopicIdRef = useRef<Record<string, string[]>>({});
  const redistributeFrameRef = useRef<number | null>(null);
  const spinGenerationRef = useRef(0);
  const spinTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    rotationRef.current = rotationDeg;
  }, [rotationDeg]);

  const stablePoolKey = useMemo(() => poolKey(topicPool), [topicPool]);
  const stableTagsKey = useMemo(() => [...suggestionTags].sort().join(","), [suggestionTags]);

  useEffect(() => {
    if (gameStarted) return;
    const syncWheelState = () => {
      if (topicPool.length === 0) {
        setWheelTopics([]);
        setVisualSegments([]);
        return;
      }
      const next = buildWheelFromPool(topicPool, suggestionTags, Math.random);
      setWheelTopics(next);
      setVisualSegments(uniformSegments(next));
    };
    const timeoutId = window.setTimeout(syncWheelState, 0);
    return () => window.clearTimeout(timeoutId);
  }, [gameStarted, stablePoolKey, stableTagsKey, topicPool, suggestionTags]);

  useEffect(() => {
    const syncSegments = () => {
      if (wheelTopics.length === 0) {
        setVisualSegments([]);
        return;
      }
      setVisualSegments(uniformSegments(wheelTopics));
    };
    const timeoutId = window.setTimeout(syncSegments, 0);
    return () => window.clearTimeout(timeoutId);
  }, [wheelTopics]);

  const labelForTopic = useCallback((topic: Topic) => {
    if (topic.id.startsWith("custom-")) return "Yours";
    const matchedSelectedTag = suggestionTags.find((tag) => topic.tags.includes(tag));
    const raw = matchedSelectedTag ?? topic.tags[0] ?? "Topic";
    return toTitleCase(raw);
  }, [suggestionTags]);

  const topicTagTitle = useCallback((topic: Topic) => {
    if (topic.id.startsWith("custom-")) return "Yours";
    const matchedSelectedTag = suggestionTags.find((tag) => topic.tags.includes(tag));
    return toTitleCase(matchedSelectedTag ?? topic.tags[0] ?? "Topic");
  }, [suggestionTags]);

  const cancelTimers = () => {
    if (spinTimeoutRef.current !== null) {
      window.clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    if (redistributeFrameRef.current !== null) {
      cancelAnimationFrame(redistributeFrameRef.current);
      redistributeFrameRef.current = null;
    }
    spinGenerationRef.current += 1;
  };

  const runRedistributeThenSpin = (afterTopics: Topic[], fromSegs: SpinWheelSegment[], toSegs: SpinWheelSegment[]) => {
    setPhase("redistributing");
    let start: number | null = null;
    const duration = 700;
    const tick = (now: number) => {
      if (start === null) {
        start = now;
      }
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setVisualSegments(lerpSegments(fromSegs, toSegs, eased));
      if (t < 1) {
        redistributeFrameRef.current = requestAnimationFrame(tick);
      } else {
        redistributeFrameRef.current = null;
        setWheelTopics(afterTopics);
        setVisualSegments(uniformSegments(afterTopics));
        setPendingRemovalTopicId(null);
        startSpinCore(afterTopics);
      }
    };
    redistributeFrameRef.current = requestAnimationFrame(tick);
  };

  const startSpinCore = (topicsSlice: Topic[]) => {
    if (topicsSlice.length === 0) return;
    setGameStarted(true);
    onGameStarted?.();

    const gen = ++spinGenerationRef.current;
    const n = topicsSlice.length;
    const selectedIndex = Math.floor(Math.random() * n);
    const nextRot = computeRotationToLandOnIndex(rotationRef.current, selectedIndex, n);
    const duration = randomSpinDurationMs(3000, 5000);
    setTransitionMs(duration);
    setPhase("spinning");

    requestAnimationFrame(() => {
      if (gen !== spinGenerationRef.current) return;
      rotationRef.current = nextRot;
      setRotationDeg(nextRot);
    });

    spinTimeoutRef.current = window.setTimeout(() => {
      spinTimeoutRef.current = null;
      if (gen !== spinGenerationRef.current) return;

      const idx = sliceIndexUnderPointer(rotationRef.current, topicsSlice.length);
      const topic = topicsSlice[idx];
      if (!topic) {
        setPhase("setup");
        return;
      }

      const asked = askedByTopicIdRef.current[topic.id] ?? [];
      const text = pickNextQuestionText(topic, topicPool, asked);
      askedByTopicIdRef.current = { ...askedByTopicIdRef.current, [topic.id]: [...asked, text] };

      setCurrentQuestion({ topic, text, tagLabel: topicTagTitle(topic) });
      onSpinQuestionChange?.({ text, topic });
      onTopicResult?.(topic);
      launchSpinConfetti();

      if (topicsSlice.length === 1) {
        setPhase("finished");
        setPendingRemovalTopicId(null);
        return;
      }

      setPhase("result");
      setPendingRemovalTopicId(topic.id);
    }, duration + 40);
  };

  const handleSpin = () => {
    if (phase === "spinning" || phase === "redistributing") return;
    if (wheelTopics.length === 0) return;
    if (phase === "finished") return;

    cancelTimers();

    if (phase === "result" && pendingRemovalTopicId) {
      const fromSegs = uniformSegments(wheelTopics);
      const afterTopics = wheelTopics.filter((t) => t.id !== pendingRemovalTopicId);
      if (afterTopics.length === 0) return;
      const toSegs = uniformSegments(afterTopics);
      runRedistributeThenSpin(afterTopics, fromSegs, toSegs);
      return;
    }

    startSpinCore(wheelTopics);
  };

  const handleReset = () => {
    cancelTimers();
    setPhase("setup");
    setGameStarted(false);
    setPendingRemovalTopicId(null);
    setCurrentQuestion(null);
    onSpinQuestionChange?.(null);
    askedByTopicIdRef.current = {};
    setRotationDeg(0);
    rotationRef.current = 0;
    setTransitionMs(4000);
    if (topicPool.length > 0) {
      const next = buildWheelFromPool(topicPool, suggestionTags, Math.random);
      setWheelTopics(next);
      setVisualSegments(uniformSegments(next));
    } else {
      setWheelTopics([]);
      setVisualSegments([]);
    }
    onSessionReset?.();
  };

  const wheelSize = 390;

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col items-center justify-evenly gap-1 px-1 py-0 sm:gap-2 sm:px-2">
      {header ? (
        <div className="max-h-[40%] w-full min-w-0 shrink-0 self-stretch overflow-y-auto text-center">
          {header}
        </div>
      ) : null}
      <div className="relative aspect-square min-h-0 w-full min-w-0 shrink [container-type:size] sm:max-w-[500px]">
        <div className="pointer-events-none absolute top-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
          <div
            className="h-0 w-0 border-x-[12px] border-t-[18px] border-x-transparent border-t-fuchsia-950 drop-shadow-md"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-3">
          <SpinWheel
            size={wheelSize}
            segments={visualSegments.length > 0 ? visualSegments : uniformSegments(wheelTopics)}
            rotationDeg={rotationDeg}
            transitionMs={transitionMs}
            spinning={phase === "spinning"}
            labelForTopic={labelForTopic}
          />
        </div>
      </div>

      <WheelControls phase={phase} sliceCount={wheelTopics.length} onSpin={handleSpin} onReset={handleReset} />
    </div>
  );
}

/** GameHost entry: random 8 slices from `topics` pool. */
export function SpinWheelMiniGame({ topics, onResult }: { topics: Topic[]; onResult: (topic: Topic) => void }) {
  return <SpinWheelGame topicPool={topics} suggestionTags={[]} onTopicResult={onResult} />;
}
