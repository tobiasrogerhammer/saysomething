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
    <div className="min-h-screen bg-linear-to-br from-violet-100/90 via-fuchsia-50/95 to-amber-100/90 px-3 pb-8 pt-4 sm:px-4 sm:pb-10 sm:pt-6 md:p-8">
      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 sm:gap-6">
        <Card className="gap-0 py-0 border-2 border-fuchsia-200/70 bg-linear-to-br from-white via-fuchsia-50/40 to-amber-50/50 shadow-lg shadow-fuchsia-900/10 ring-1 ring-violet-200/50">
          <CardContent className="px-0 pt-0 sm:pb-8">
            <div className="flex items-start justify-between gap-3 border-b border-fuchsia-200/50 px-3 pb-4 pt-3 sm:px-4 lg:hidden">
              <div className="min-w-0 space-y-2">
                <img
                  src="/logo.png?v=2"
                  alt="Say Something"
                  className="h-auto w-[min(14rem,100%)]"
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
            <div className="flex min-w-0 flex-col-reverse gap-5 px-3 sm:px-4 lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-stretch lg:gap-0 lg:px-0">
              <aside className="hidden min-w-0 border-fuchsia-200/50 bg-linear-to-b from-fuchsia-50/45 via-white/50 to-violet-50/35 lg:block lg:max-w-[340px] lg:border-r lg:px-5 lg:py-6">
                <div className="mb-5 space-y-2 border-b border-fuchsia-200/50 pb-4">
                  <img
                    src="/logo.png?v=2"
                    alt="Say Something"
                    className="h-auto w-[min(18rem,100%)]"
                  />
                </div>
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

              <section className="mt-3 flex min-w-0 flex-col gap-4 px-0 sm:mt-4 sm:gap-6 lg:mt-0 lg:px-8 lg:py-6">
                {noTopicMatch ? (
                  <div className="space-y-3 rounded-xl border border-dashed border-violet-300/70 bg-violet-50/50 px-4 py-8 text-center text-base text-violet-950/80 sm:p-10 sm:text-sm">
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
                        <p className="min-h-14 text-base font-semibold leading-relaxed text-violet-950 sm:min-h-16 sm:text-lg">
                          {lastTopic ? lastTopic.text : "Spin the wheel to reveal your next conversation topic."}
                        </p>
                        {!noTopicMatch &&
                        spinQuestion &&
                        spinQuestion.text.trim() !== (lastTopic?.text ?? "").trim() ? (
                          <p className="mt-4 min-h-16 border-t border-violet-200/60 pt-4 text-base font-semibold leading-relaxed text-violet-950 sm:min-h-20 sm:text-lg">
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
