"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { SpinWheelGame, type SpinWheelSpinQuestion } from "@/components/games/SpinWheelGame";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Topic } from "@/allTopics/topics";
import { DEFAULT_SUGGESTION_TAGS, filterTopics } from "@/lib/filterTopics";
import { useTopicStore } from "@/store/useTopicStore";
import { GameSettingsPanel } from "@/features/game-settings/GameSettingsPanel";
import { useTopicSources } from "@/features/topics/import/useTopicSources";

const depthLevels: Array<1 | 2 | 3> = [1, 2, 3];

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
    clearLastTopic,
    recordTopic,
  } = useTopicStore();

  const resetTopicPoolState = () => {
    clearSuggestionTags();
    clearSeenTopicIds();
    setSpinSettingsLocked(false);
    setSpinQuestion(null);
  };

  const {
    activeTopics,
    selectedTopicFileName,
    pastedTopicsCount,
    pastedTopicsDraft,
    setPastedTopicsDraft,
    lastAppliedPastedRaw,
    fileImportError,
    pasteImportError,
    importTopicFile,
    clearTopicFile,
    savePastedTopics,
    clearPastedTopics,
  } = useTopicSources({ onTopicPoolReset: resetTopicPoolState });

  const filters = useMemo(
    () => ({ safeMode, depthLevels: depthLevelsSelected, suggestionTags }),
    [safeMode, depthLevelsSelected, suggestionTags],
  );
  const filteredPersonalTopics = useMemo(
    () => filterTopics(customTopics, { safeMode, depthLevels: depthLevelsSelected }),
    [customTopics, safeMode, depthLevelsSelected],
  );
  const filteredDefaultTopics = useMemo(() => filterTopics(activeTopics, filters), [activeTopics, filters]);
  const availableTags = useMemo(() => {
    const unique = new Set<string>();
    for (const topic of activeTopics) {
      for (const tag of topic.tags) {
        unique.add(tag);
      }
    }
    const activeTagList = Array.from(unique).sort((a, b) => a.localeCompare(b));
    if (activeTagList.length > 0) {
      return activeTagList;
    }
    return [...DEFAULT_SUGGESTION_TAGS];
  }, [activeTopics]);
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
    clearLastTopic();
    setSpinQuestion(null);
    setSpinSettingsLocked(false);
  };

  const handleResetGame = () => {
    clearSeenTopicIds();
    clearLastTopic();
    setSpinQuestion(null);
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

  const enableMoreDepth = () => {
    const missing = depthLevels.filter((level) => !depthLevelsSelected.includes(level));
    missing.forEach((level) => toggleDepthLevel(level));
  };

  const submitConversationTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addConversationTopic();
  };

  const noTopicMatch = spinWheelTopicPool.length === 0;

  return (
    <div className="h-dvh overflow-hidden bg-linear-to-br from-violet-100/90 via-fuchsia-50/95 to-amber-100/90 p-2 sm:p-4 md:p-6">
      <main className="mx-auto flex h-full w-full min-w-0 max-w-6xl flex-col">
        <Card className="min-h-0 flex-1 gap-0 py-0 border-2 border-fuchsia-200/70 bg-linear-to-br from-white via-fuchsia-50/40 to-amber-50/50 shadow-lg shadow-fuchsia-900/10 ring-1 ring-violet-200/50">
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="flex items-start justify-between gap-3 shrink-0 border-b border-fuchsia-200/50 px-3 pb-2 pt-2 sm:px-4 lg:hidden">
              <div className="min-w-0 space-y-2">
                <img
                  src="/logo.png?v=2"
                  alt="Say Something"
                  className="h-auto max-h-12 w-auto max-w-[min(14rem,100%)]"
                />
              </div>
              <Sheet modal="trap-focus">
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-lg" }),
                    "shrink-0 touch-manipulation",
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
                    availableTags={availableTags}
                    matchedDefaultTagTopicsCount={matchedDefaultTagTopicsCount}
                    customTopics={customTopics}
                    removePersonalTopic={removePersonalTopic}
                    onImportTopicFile={importTopicFile}
                    selectedTopicFileName={selectedTopicFileName}
                    pastedTopicsCount={pastedTopicsCount}
                    pastedTopicsDraft={pastedTopicsDraft}
                    lastAppliedPastedRaw={lastAppliedPastedRaw}
                    onClearTopicFile={clearTopicFile}
                    onPastedTopicsDraftChange={setPastedTopicsDraft}
                    onSavePastedTopics={savePastedTopics}
                    onClearPastedTopics={clearPastedTopics}
                    fileImportError={fileImportError}
                    pasteImportError={pasteImportError}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 sm:px-4 lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-0 lg:px-0">
              <aside className="hidden min-h-0 min-w-0 lg:overflow-y-auto border-fuchsia-200/50 bg-white/40 lg:block lg:max-w-[380px] lg:border-r lg:px-5 lg:py-3">
                <div className="mb-3 border-b border-fuchsia-200/50 pb-2">
                  <img
                    src="/logo.png?v=2"
                    alt="Say Something"
                    className="h-auto w-[min(11rem,100%)]"
                  />
                </div>
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
                  availableTags={availableTags}
                  matchedDefaultTagTopicsCount={matchedDefaultTagTopicsCount}
                  customTopics={customTopics}
                  removePersonalTopic={removePersonalTopic}
                  onImportTopicFile={importTopicFile}
                  selectedTopicFileName={selectedTopicFileName}
                  pastedTopicsCount={pastedTopicsCount}
                  pastedTopicsDraft={pastedTopicsDraft}
                  lastAppliedPastedRaw={lastAppliedPastedRaw}
                  onClearTopicFile={clearTopicFile}
                  onPastedTopicsDraftChange={setPastedTopicsDraft}
                  onSavePastedTopics={savePastedTopics}
                  onClearPastedTopics={clearPastedTopics}
                  fileImportError={fileImportError}
                  pasteImportError={pasteImportError}
                />
              </aside>

              <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-0 py-2 sm:py-3 lg:px-8 lg:py-5">
                {noTopicMatch ? (
                  <div className="space-y-3 rounded-xl border border-dashed border-violet-300/70 bg-violet-50/50 px-4 py-8 text-center text-base text-violet-950/80 sm:p-10 sm:text-base">
                    <p>No topics match these filters. Try changing safe mode, depth, or tags in Game settings.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button type="button" variant="outline" onClick={enableMoreDepth}>
                        Enable more depth
                      </Button>
                      <Button type="button" variant="outline" onClick={clearSuggestionTags}>
                        Clear tags
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setSafeMode(false)}>
                        Turn off safe mode
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-11 min-w-32 touch-manipulation border-fuchsia-200 bg-white text-base text-fuchsia-900 hover:bg-fuchsia-50 sm:min-h-10 sm:text-base"
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
                        <p className="line-clamp-2 text-xl font-bold leading-snug text-violet-950 sm:text-2xl">
                          {lastTopic ? lastTopic.text : "Spin the wheel to reveal your next conversation topic."}
                        </p>
                        {!noTopicMatch &&
                        spinQuestion &&
                        spinQuestion.text.trim() !== (lastTopic?.text ?? "").trim() ? (
                          <p className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-violet-800 sm:text-xl">
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
