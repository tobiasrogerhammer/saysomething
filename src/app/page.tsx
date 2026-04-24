"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Settings, X } from "lucide-react";
import { SpinWheelGame, type SpinWheelSpinQuestion } from "@/components/games/SpinWheelGame";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { topics, type Topic } from "@/data/topics";
import { filterTopics, SUGGESTION_TAGS, type SuggestionTag } from "@/lib/filterTopics";
import { useTopicStore } from "@/store/useTopicStore";

const depthSelectedDisplay: Record<1 | 2 | 3, string> = {
  1: "Small talk",
  2: "Personal",
  3: "Meaningful",
};

const depthLevels: Array<1 | 2 | 3> = [1, 2, 3];

const tagColorClasses = [
  "bg-rose-500 text-white hover:bg-rose-600",
  "bg-orange-500 text-white hover:bg-orange-600",
  "bg-amber-500 text-white hover:bg-amber-600",
  "bg-lime-500 text-white hover:bg-lime-600",
  "bg-emerald-500 text-white hover:bg-emerald-600",
  "bg-cyan-500 text-white hover:bg-cyan-600",
  "bg-sky-500 text-white hover:bg-sky-600",
  "bg-indigo-500 text-white hover:bg-indigo-600",
  "bg-violet-500 text-white hover:bg-violet-600",
  "bg-fuchsia-500 text-white hover:bg-fuchsia-600",
  "bg-pink-500 text-white hover:bg-pink-600",
  "bg-teal-500 text-white hover:bg-teal-600",
] as const;

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

type GameSettingsPanelProps = {
  showHeading: boolean;
  safeMode: boolean;
  setSafeMode: (value: boolean) => void;
  depthLevelsSelected: Array<1 | 2 | 3>;
  toggleDepthLevel: (value: 1 | 2 | 3) => void;
  newTopicText: string;
  setNewTopicText: (value: string) => void;
  onSubmitTopic: (event: FormEvent<HTMLFormElement>) => void;
  spinSettingsLocked: boolean;
  suggestionTags: SuggestionTag[];
  toggleSuggestionTag: (tag: SuggestionTag) => void;
  clearSuggestionTags: () => void;
  matchedDefaultTagTopicsCount: number;
  customTopics: Topic[];
  removePersonalTopic: (topicId: string) => void;
};

function GameSettingsPanel({
  showHeading,
  safeMode,
  setSafeMode,
  depthLevelsSelected,
  toggleDepthLevel,
  newTopicText,
  setNewTopicText,
  onSubmitTopic,
  spinSettingsLocked,
  suggestionTags,
  toggleSuggestionTag,
  clearSuggestionTags,
  matchedDefaultTagTopicsCount,
  customTopics,
  removePersonalTopic,
}: GameSettingsPanelProps) {
  return (
    <div className="space-y-4 text-slate-800 sm:space-y-5">
      <div className="space-y-2">
        {showHeading ? (
          <p className="text-sm font-semibold tracking-wider text-violet-950 uppercase">Game settings</p>
        ) : null}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
              <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-violet-950">Safe mode</span>
              <Select value={safeMode ? "On" : "Off"} onValueChange={(value) => setSafeMode(value === "On")}>
                <SelectTrigger className="h-11 min-h-11 w-32 shrink-0 touch-manipulation border-fuchsia-200/50 bg-white/90 text-slate-900 sm:h-9 sm:min-h-0">
                  <SelectValue placeholder="Safe mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On">On</SelectItem>
                  <SelectItem value="Off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs leading-snug text-slate-600">When on, avoids topics about brands and politics.</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-violet-950">Depth level</span>
            <div className="flex flex-nowrap gap-1.5">
              {depthLevels.map((level) => {
                const active = depthLevelsSelected.includes(level);
                return (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "h-9 min-w-0 flex-1 touch-manipulation text-xs",
                      active ? "bg-violet-700 text-white hover:bg-violet-800" : "border-fuchsia-200/70 bg-white/80 text-slate-800",
                    )}
                    onClick={() => toggleDepthLevel(level)}
                    disabled={spinSettingsLocked}
                  >
                    {depthSelectedDisplay[level]}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs leading-snug text-slate-600">
              {depthLevelsSelected.map((level) => depthSelectedDisplay[level]).join(", ")} depth levels currently selected
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-fuchsia-200/50" />

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wider text-violet-950 uppercase">Add personal topic</p>
        <form className="flex flex-row flex-nowrap items-center gap-2" onSubmit={onSubmitTopic}>
          <input
            value={newTopicText}
            onChange={(event) => setNewTopicText(event.target.value)}
            placeholder="Type your topic suggestion..."
            className="min-h-11 min-w-0 flex-1 touch-manipulation rounded-md border border-fuchsia-200/60 bg-white/90 px-3 text-base text-slate-900 sm:h-9 sm:min-h-0 sm:text-sm"
          />
          <Button
            type="submit"
            disabled={!newTopicText.trim()}
            aria-label="Add personal topic"
            className="min-h-11 min-w-11 shrink-0 touch-manipulation border border-fuchsia-200/60 bg-white/90 p-0 text-black hover:bg-white disabled:border-fuchsia-200/60 disabled:bg-white/90 disabled:text-black disabled:opacity-100 sm:h-9 sm:min-h-0 sm:min-w-9"
          >
            <Plus className="size-5 sm:size-4" aria-hidden />
          </Button>
        </form>
      </div>

      <div className="h-px bg-fuchsia-200/50" />

      <div className="min-w-0 space-y-2">
        <p className="text-xs font-semibold tracking-wider text-violet-950 uppercase">Current selections</p>
        {spinSettingsLocked ? (
          <p className="text-xs text-slate-600">Tags are locked while this round is in progress. Reset the wheel game to change tags.</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
          <span className="text-sm font-semibold text-violet-950">Tags:</span>
          {suggestionTags.length > 0 ? (
            suggestionTags.map((tag) => {
              const colorClass = tagColorClasses[SUGGESTION_TAGS.indexOf(tag) % tagColorClasses.length];
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={spinSettingsLocked}
                  className={`rounded-full px-3 py-1 text-xs transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 ${colorClass}`}
                  onClick={() => toggleSuggestionTag(tag as SuggestionTag)}
                  title="Click to remove tag"
                >
                  {toTitleCase(tag)}
                </button>
              );
            })
          ) : (
            <span className="text-sm font-semibold text-violet-800/80">None</span>
          )}
        </div>
        <Popover>
          <PopoverTrigger
            disabled={spinSettingsLocked}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-fuchsia-200/70 bg-white/80 px-3.5 text-sm font-medium text-slate-800 shadow-none transition-colors hover:border-fuchsia-300/80 hover:bg-white disabled:pointer-events-none disabled:opacity-40 sm:min-h-8 sm:w-auto sm:text-xs"
          >
            + Add tags
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(calc(100vw-1.5rem),20rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-none sm:w-80"
            align="start"
            side="bottom"
            sideOffset={6}
            collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          >
            <PopoverHeader>
              <PopoverTitle className="text-base font-semibold text-violet-950">Choose tags</PopoverTitle>
            </PopoverHeader>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_TAGS.map((tag) => {
                const active = suggestionTags.includes(tag);
                const colorClass = tagColorClasses[SUGGESTION_TAGS.indexOf(tag) % tagColorClasses.length];
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={spinSettingsLocked}
                    onClick={() => toggleSuggestionTag(tag as SuggestionTag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 ${
                      active
                        ? `${colorClass} hover:opacity-90`
                        : "border border-fuchsia-200/60 bg-white/80 text-slate-800 hover:bg-white"
                    }`}
                  >
                    {toTitleCase(tag)}
                  </button>
                );
              })}
            </div>
            {suggestionTags.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start px-0 text-muted-foreground"
                disabled={spinSettingsLocked}
                onClick={() => clearSuggestionTags()}
              >
                Clear all tags
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>
        {suggestionTags.length > 0 && matchedDefaultTagTopicsCount < 8 ? (
          <p className="rounded-md border border-amber-300/70 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950/90">
            Only {matchedDefaultTagTopicsCount} topic{matchedDefaultTagTopicsCount === 1 ? "" : "s"} match your selected tags with the
            current safe mode and depth. Try adding more tags or changing safe mode/depth to fill more slices.
          </p>
        ) : null}
        {customTopics.length > 0 ? (
          <div className="space-y-1.5 border-t border-fuchsia-200/40 pt-2">
            <p className="text-xs font-medium text-violet-900/90">Personal topics</p>
            <ul className="list-none space-y-1.5">
              {customTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="flex items-start gap-1.5 rounded-md border border-fuchsia-200/40 bg-white/70 px-2 py-1.5 text-base leading-snug text-slate-800"
                >
                  <span className="min-w-0 flex-1">{topic.text}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 shrink-0 touch-manipulation p-0 text-slate-600 hover:bg-rose-100/90 hover:text-rose-800 sm:h-7 sm:w-7"
                    disabled={spinSettingsLocked}
                    onClick={() => removePersonalTopic(topic.id)}
                    aria-label={`Remove personal topic: ${topic.text}`}
                    title={spinSettingsLocked ? "Reset the wheel game to edit personal topics" : "Remove"}
                  >
                    <X className="size-[18px] sm:size-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);
  const [newTopicText, setNewTopicText] = useState("");
  const [spinSettingsLocked, setSpinSettingsLocked] = useState(false);
  const [spinQuestion, setSpinQuestion] = useState<SpinWheelSpinQuestion | null>(null);
  const {
    safeMode,
    depthLevels: depthLevelsSelected,
    suggestionTags,
    lastTopic,
    setSafeMode,
    toggleDepthLevel,
    toggleSuggestionTag,
    clearSuggestionTags,
    clearSeenTopicIds,
    recordTopic,
  } = useTopicStore();

  const filters = useMemo(
    () => ({ safeMode, depthLevels: depthLevelsSelected, suggestionTags }),
    [safeMode, depthLevelsSelected, suggestionTags],
  );
  const filteredPersonalTopics = useMemo(
    () => filterTopics(customTopics, { safeMode, depthLevels: depthLevelsSelected }),
    [customTopics, safeMode, depthLevelsSelected],
  );
  const filteredDefaultTopics = useMemo(() => filterTopics(topics, filters), [filters]);
  const matchedDefaultTagTopicsCount = useMemo(() => {
    if (suggestionTags.length === 0) return 0;
    return filteredDefaultTopics.filter((topic) => suggestionTags.some((tag) => topic.tags.includes(tag))).length;
  }, [filteredDefaultTopics, suggestionTags]);
  /** Personal topics ignore tag filters so they always reach the wheel; defaults use full filters. */
  const spinWheelTopicPool = useMemo(() => {
    const seen = new Set<string>();
    const out: Topic[] = [];
    for (const topic of filteredPersonalTopics) {
      if (!seen.has(topic.id)) {
        seen.add(topic.id);
        out.push(topic);
      }
    }
    for (const topic of filteredDefaultTopics) {
      if (!seen.has(topic.id)) {
        seen.add(topic.id);
        out.push(topic);
      }
    }
    return out;
  }, [filteredPersonalTopics, filteredDefaultTopics]);

  const handleSpinWheelSessionReset = () => {
    clearSeenTopicIds();
    setSpinSettingsLocked(false);
  };

  const handleResetGame = () => {
    clearSeenTopicIds();
    setSpinSettingsLocked(false);
  };

  const addConversationTopic = () => {
    const text = newTopicText.trim();
    if (!text) return;

    const customTopic: Topic = {
      id: `custom-${Date.now()}`,
      text,
      tags: ["storytelling"],
      depthLevel: depthLevelsSelected[0] ?? 1,
      safetyLevel: "safe",
    };

    setCustomTopics((current) => [customTopic, ...current]);
    setNewTopicText("");
  };

  const removePersonalTopic = (topicId: string) => {
    setCustomTopics((current) => current.filter((topic) => topic.id !== topicId));
  };

  const submitConversationTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addConversationTopic();
  };

  const noTopicMatch = spinWheelTopicPool.length === 0;

  useEffect(() => {
    if (noTopicMatch) {
      setSpinQuestion(null);
    }
  }, [noTopicMatch]);

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-100/90 via-fuchsia-50/95 to-amber-100/90 px-3 pb-8 pt-4 sm:px-4 sm:pb-10 sm:pt-6 md:p-8">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 sm:gap-6">
        <Card className="gap-0 py-0 border-2 border-fuchsia-200/70 bg-linear-to-br from-white via-fuchsia-50/40 to-amber-50/50 shadow-lg shadow-fuchsia-900/10 ring-1 ring-violet-200/50">
          <CardHeader className="border-b border-fuchsia-200/50 bg-linear-to-r from-fuchsia-50/90 via-white to-amber-50/80 px-3 pb-4 pt-4 sm:px-4 sm:pt-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <CardTitle className="max-w-full">
                  <img
                    src="/logo.png?v=2"
                    alt="Say Something"
                    className="h-auto w-[min(18rem,100%)] sm:w-[min(20rem,100%)]"
                  />
                </CardTitle>
                <CardDescription className="text-violet-950/75">
                  Play a mini-game and pull a topic for your next meeting.
                </CardDescription>
              </div>
              <Sheet modal="trap-focus">
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-lg" }),
                    "shrink-0 touch-manipulation lg:hidden",
                  )}
                  aria-label="Open game settings"
                >
                  <Settings className="size-5" aria-hidden />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 overflow-y-auto border-l border-fuchsia-200/50 bg-linear-to-b from-fuchsia-50/50 via-white to-violet-50/30 p-4 sm:max-w-sm"
                >
                  <SheetHeader className="p-0 pb-4">
                    <SheetTitle className="text-lg font-semibold text-violet-950">Game settings</SheetTitle>
                  </SheetHeader>
                  <GameSettingsPanel
                    showHeading={false}
                    safeMode={safeMode}
                    setSafeMode={setSafeMode}
                    depthLevelsSelected={depthLevelsSelected}
                    toggleDepthLevel={toggleDepthLevel}
                    newTopicText={newTopicText}
                    setNewTopicText={setNewTopicText}
                    onSubmitTopic={submitConversationTopic}
                    spinSettingsLocked={spinSettingsLocked}
                    suggestionTags={suggestionTags}
                    toggleSuggestionTag={toggleSuggestionTag}
                    clearSuggestionTags={clearSuggestionTags}
                    matchedDefaultTagTopicsCount={matchedDefaultTagTopicsCount}
                    customTopics={customTopics}
                    removePersonalTopic={removePersonalTopic}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-0 sm:pb-8">
            <div className="flex min-w-0 flex-col-reverse gap-5 px-3 sm:px-4 lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-stretch lg:gap-0 lg:px-0">
              <aside className="hidden min-w-0 border-fuchsia-200/50 bg-linear-to-b from-fuchsia-50/45 via-white/50 to-violet-50/35 lg:block lg:max-w-[340px] lg:border-r lg:px-5 lg:py-6">
                <GameSettingsPanel
                  showHeading
                  safeMode={safeMode}
                  setSafeMode={setSafeMode}
                  depthLevelsSelected={depthLevelsSelected}
                  toggleDepthLevel={toggleDepthLevel}
                  newTopicText={newTopicText}
                  setNewTopicText={setNewTopicText}
                  onSubmitTopic={submitConversationTopic}
                  spinSettingsLocked={spinSettingsLocked}
                  suggestionTags={suggestionTags}
                  toggleSuggestionTag={toggleSuggestionTag}
                  clearSuggestionTags={clearSuggestionTags}
                  matchedDefaultTagTopicsCount={matchedDefaultTagTopicsCount}
                  customTopics={customTopics}
                  removePersonalTopic={removePersonalTopic}
                />
              </aside>

              <section className="flex min-w-0 flex-col gap-4 px-0 sm:gap-6 lg:px-8 lg:py-6">
                {noTopicMatch ? (
                  <div className="space-y-3 rounded-xl border border-dashed border-violet-300/70 bg-violet-50/50 px-4 py-8 text-center text-base text-violet-950/80 sm:p-10 sm:text-sm">
                    <p>No topics match these filters. Try changing safe mode, depth, or tags in Game settings.</p>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-11 min-w-32 touch-manipulation border-fuchsia-200 bg-white text-base text-fuchsia-900 hover:bg-fuchsia-50 sm:min-h-10 sm:text-sm"
                        onClick={handleResetGame}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                ) : (
                  <SpinWheelGame
                    header={
                      <>
                        <p className="min-h-12 text-base font-semibold leading-relaxed text-violet-950 sm:text-lg">
                          {lastTopic ? lastTopic.text : "Spin the wheel to reveal your next conversation topic."}
                        </p>
                        {spinQuestion &&
                        spinQuestion.text.trim() !== (lastTopic?.text ?? "").trim() ? (
                          <p className="mt-4 border-t border-violet-200/60 pt-4 text-base font-semibold leading-relaxed text-violet-950 sm:text-lg">
                            {spinQuestion.text}
                          </p>
                        ) : null}
                      </>
                    }
                    topicPool={spinWheelTopicPool}
                    suggestionTags={suggestionTags}
                    onTopicResult={recordTopic}
                    onSpinQuestionChange={setSpinQuestion}
                    onGameStarted={() => setSpinSettingsLocked(true)}
                    onSessionReset={handleSpinWheelSessionReset}
                  />
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
