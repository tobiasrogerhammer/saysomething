"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Check, FileUp, ListPlus, Plus, SlidersHorizontal, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Topic } from "@/allTopics/topics";
import type { SuggestionTag } from "@/lib/filterTopics";
import { cn } from "@/lib/utils";

const depthSelectedDisplay: Record<1 | 2 | 3, string> = {
  1: "Small talk",
  2: "Personal",
  3: "Meaningful",
};

const depthDescription: Record<1 | 2 | 3, string> = {
  1: "Light and easy icebreakers",
  2: "Share a bit about yourself",
  3: "Deeper, reflective questions",
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold tracking-widest text-violet-800/70 uppercase">{children}</h3>;
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export type GameSettingsPanelProps = {
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
  availableTags: SuggestionTag[];
  matchedDefaultTagTopicsCount: number;
  customTopics: Topic[];
  removePersonalTopic: (topicId: string) => void;
  onImportTopicFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  selectedTopicFileName: string | null;
  pastedTopicsCount: number;
  pastedTopicsDraft: string;
  lastAppliedPastedRaw: string;
  onClearTopicFile: () => void;
  onPastedTopicsDraftChange: (value: string) => void;
  onSavePastedTopics: () => void;
  onClearPastedTopics: () => void;
  fileImportError: string | null;
  pasteImportError: string | null;
};

export function GameSettingsPanel({
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
  availableTags,
  matchedDefaultTagTopicsCount,
  customTopics,
  removePersonalTopic,
  onImportTopicFile,
  selectedTopicFileName,
  pastedTopicsCount,
  pastedTopicsDraft,
  lastAppliedPastedRaw,
  onClearTopicFile,
  onPastedTopicsDraftChange,
  onSavePastedTopics,
  onClearPastedTopics,
  fileImportError,
  pasteImportError,
}: GameSettingsPanelProps) {
  /** Shift tag popover left on narrow viewports so it stays on-screen (sheet / full-width trigger). */
  const [tagPopoverAlignOffset, setTagPopoverAlignOffset] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setTagPopoverAlignOffset(mq.matches ? -28 : 0);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const saveDisabled = !pastedTopicsDraft.trim() || pastedTopicsDraft === lastAppliedPastedRaw;
  const submitBulkTopics = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSavePastedTopics();
  };

  return (
    <div className="space-y-4 text-slate-800">
      {showHeading ? <SectionHeading>Game settings</SectionHeading> : null}
      {spinSettingsLocked ? (
        <p className="rounded-md bg-amber-50/80 px-3 py-2 text-sm text-amber-950/90 ring-1 ring-amber-300/60">
          Locked while a spin round is active. Reset the wheel to change settings.
        </p>
      ) : null}

      <Tabs defaultValue="filters" className="gap-4">
        <TabsList className="h-11! w-full bg-violet-100/60 p-1">
          <TabsTrigger value="filters" disabled={spinSettingsLocked} className="gap-2 text-base">
            <SlidersHorizontal aria-hidden />
            Filters
            {suggestionTags.length > 0 ? (
              <span className="rounded-full bg-violet-700 px-1.5 text-sm leading-5 font-semibold text-white">
                {suggestionTags.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="topics" disabled={spinSettingsLocked} className="gap-2 text-base">
            <ListPlus aria-hidden />
            Topics
            {customTopics.length > 0 ? (
              <span className="rounded-full bg-violet-700 px-1.5 text-sm leading-5 font-semibold text-white">
                {customTopics.length}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <section className="space-y-3">
            <SectionHeading>Rules</SectionHeading>
            <div className="divide-y divide-fuchsia-200/50 rounded-xl border border-fuchsia-200/60 bg-white/80 shadow-xs">
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 p-3",
                  spinSettingsLocked && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="min-w-0 space-y-0.5">
                  <span className="block text-base font-semibold text-violet-950">Safe mode</span>
                  <span className="block text-sm leading-snug text-slate-600">
                    Skips brand and politics topics.
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "w-7 text-right text-sm font-semibold tabular-nums",
                      safeMode ? "text-emerald-700" : "text-slate-500",
                    )}
                  >
                    {safeMode ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={safeMode}
                    onCheckedChange={setSafeMode}
                    aria-label="Safe mode"
                    disabled={spinSettingsLocked}
                    className="data-checked:bg-emerald-500 data-unchecked:bg-slate-300"
                  />
                </span>
              </label>

              <div className="space-y-2 p-3" role="group" aria-labelledby="depth-heading">
                <div className="flex items-baseline justify-between gap-2">
                  <span id="depth-heading" className="text-base font-semibold text-violet-950">
                    Depth level
                  </span>
                  <span className="text-sm text-slate-500">Pick one or more</span>
                </div>
                <div className="space-y-2">
                  {depthLevels.map((level) => {
                    const active = depthLevelsSelected.includes(level);
                    const isLastSelected = active && depthLevelsSelected.length === 1;
                    return (
                      <button
                        key={level}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        aria-disabled={isLastSelected || undefined}
                        className={cn(
                          "flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-lg border px-3 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
                          active
                            ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500/30"
                            : "border-fuchsia-200/70 bg-white hover:border-violet-300 hover:bg-violet-50/50",
                        )}
                        onClick={() => toggleDepthLevel(level)}
                        disabled={spinSettingsLocked}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                            active ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 bg-white text-transparent",
                          )}
                        >
                          <Check className="size-4" strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-semibold text-violet-950">{depthSelectedDisplay[level]}</span>
                          <span className="sr-only text-sm leading-snug text-slate-600 [@media(min-height:860px)]:not-sr-only [@media(min-height:860px)]:block">
                            {depthDescription[level]}
                          </span>
                        </span>
                        <span aria-hidden className="flex shrink-0 items-end gap-0.5">
                          {depthLevels.map((bar) => (
                            <span
                              key={bar}
                              className={cn(
                                "w-1.5 rounded-full",
                                bar === 1 ? "h-2" : bar === 2 ? "h-3.5" : "h-5",
                                bar <= level ? (active ? "bg-violet-600" : "bg-violet-300") : "bg-slate-200",
                              )}
                            />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-3">
            <SectionHeading>Tags</SectionHeading>
            <div className="flex flex-wrap items-center gap-2">
              {suggestionTags.map((tag) => {
                const colorClass = tagColorClasses[availableTags.indexOf(tag) % tagColorClasses.length];
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={spinSettingsLocked}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-base font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 ${colorClass}`}
                    onClick={() => toggleSuggestionTag(tag as SuggestionTag)}
                    title="Click to remove tag"
                  >
                    {toTitleCase(tag)}
                    <X className="size-3.5 opacity-80" aria-hidden />
                  </button>
                );
              })}
              <Popover>
                <PopoverTrigger
                  disabled={spinSettingsLocked}
                  className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full border border-dashed border-violet-300 bg-white/70 px-3 text-base font-medium text-violet-900 transition-colors hover:border-violet-400 hover:bg-white disabled:pointer-events-none disabled:opacity-40"
                >
                  <Plus className="size-3.5" aria-hidden />
                  {suggestionTags.length > 0 ? "Add" : "Add tags"}
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(calc(100vw-1rem),20rem)] max-w-[min(calc(100vw-1rem),20rem)] sm:max-w-none sm:w-80"
                  align="start"
                  alignOffset={tagPopoverAlignOffset}
                  side="bottom"
                  sideOffset={6}
                >
                  <PopoverHeader>
                    <PopoverTitle className="text-base font-semibold text-violet-950">Choose tags</PopoverTitle>
                  </PopoverHeader>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const active = suggestionTags.includes(tag);
                      const colorClass = tagColorClasses[availableTags.indexOf(tag) % tagColorClasses.length];
                      return (
                        <button
                          key={tag}
                          type="button"
                          disabled={spinSettingsLocked}
                          onClick={() => toggleSuggestionTag(tag as SuggestionTag)}
                          className={`rounded-full px-3 py-1 text-base font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 ${
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
            </div>
            {suggestionTags.length === 0 ? (
              <p className="text-sm text-slate-600">No tag filter, so topics from every tag are used.</p>
            ) : null}
            {suggestionTags.length > 0 && matchedDefaultTagTopicsCount < 8 ? (
              <p className="rounded-md border border-amber-300/70 bg-amber-50/80 px-3 py-2 text-sm leading-relaxed text-amber-950/90">
                Only {matchedDefaultTagTopicsCount} topic{matchedDefaultTagTopicsCount === 1 ? "" : "s"} match your selected tags with the
                current safe mode and depth. Try adding more tags or changing safe mode/depth to fill more slices.
              </p>
            ) : null}
          </section>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading>Topic source</SectionHeading>
              <Sheet modal="trap-focus">
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-10 border-violet-200 bg-white px-3 text-base text-violet-900 hover:bg-violet-50",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FileUp className="size-4" aria-hidden />
                    <span>Import topics</span>
                  </span>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 overflow-y-auto border-l border-fuchsia-200/50 bg-linear-to-b from-fuchsia-50/50 via-white to-violet-50/30 p-4 sm:max-w-lg"
                >
                  <SheetHeader className="p-0 pb-4">
                    <SheetTitle className="text-lg font-semibold text-violet-950">Import topics</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold tracking-wider text-violet-950 uppercase">Topic data source</p>
                      <div className="flex items-center gap-1 overflow-hidden">
                        <input id="topics-file-input" name="topicsFile" type="file" accept=".json,.txt" onChange={onImportTopicFile} className="hidden" />
                        <label
                          htmlFor="topics-file-input"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fuchsia-200/70 bg-white/90 px-3 py-2 text-base font-medium text-slate-800 hover:bg-white"
                        >
                          <FileUp className="size-4" aria-hidden />
                          <span>Choose file</span>
                        </label>
                        {selectedTopicFileName ? (
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-md border border-fuchsia-200/70 bg-white/80 px-2.5 py-2 text-base text-violet-950">
                            <span className="truncate">{selectedTopicFileName}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 shrink-0 p-0 text-rose-600 hover:bg-rose-100/90 hover:text-rose-800"
                              onClick={onClearTopicFile}
                              aria-label="Remove selected file"
                              title="Remove selected file"
                            >
                              <X className="size-4" aria-hidden />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-sm leading-snug text-slate-600">
                        Accepts `.json` (array of strings/topics) or `.txt` (one topic per line).
                      </p>
                      {fileImportError ? <p className="text-sm leading-snug text-rose-700">{fileImportError}</p> : null}
                    </div>

                    <div className="h-px bg-fuchsia-200/50" />

                    <form className="space-y-2" onSubmit={submitBulkTopics}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold tracking-wider text-violet-950 uppercase">Input topics</p>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="submit"
                            size="lg"
                            className="bg-violet-700 text-white hover:bg-violet-800"
                            disabled={saveDisabled}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="border-fuchsia-200/70 bg-white/90 text-slate-800 hover:bg-white"
                            onClick={onClearPastedTopics}
                            disabled={!pastedTopicsDraft.trim() && pastedTopicsCount === 0}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <textarea
                        value={pastedTopicsDraft}
                        onChange={(event) => onPastedTopicsDraftChange(event.target.value)}
                        placeholder={"Input one topic per line...\nWhat project are you most excited about this quarter?\nWhat helps you recharge after a busy week?"}
                        className="min-h-56 w-full rounded-md border border-fuchsia-200/60 bg-white/90 px-3 py-2 text-base text-slate-900"
                      />
                      {pasteImportError ? <p className="text-sm leading-snug text-rose-700">{pasteImportError}</p> : null}
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <p className="text-sm text-slate-600">
              {selectedTopicFileName || pastedTopicsCount > 0 ? (
                <>
                  {selectedTopicFileName ? (
                    <>
                      File: <span className="font-medium text-violet-950">{selectedTopicFileName}</span>
                    </>
                  ) : null}
                  {selectedTopicFileName && pastedTopicsCount > 0 ? " · " : null}
                  {pastedTopicsCount > 0 ? (
                    <>
                      Pasted topics: <span className="font-medium text-violet-950">{pastedTopicsCount}</span>
                    </>
                  ) : null}
                </>
              ) : (
                "Using the default topic set."
              )}
            </p>

            <form className="space-y-1.5" onSubmit={onSubmitTopic}>
              <label htmlFor="personal-topic-input" className="block text-base font-semibold text-violet-950">
                Add a personal topic
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="personal-topic-input"
                  value={newTopicText}
                  onChange={(event) => setNewTopicText(event.target.value)}
                  placeholder="Type your own topic..."
                  disabled={spinSettingsLocked}
                  className="min-h-11 min-w-0 flex-1 touch-manipulation rounded-lg border border-fuchsia-200/70 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-300/40 focus-visible:outline-none disabled:opacity-50 sm:min-h-10 sm:text-base"
                />
                <Button
                  type="submit"
                  disabled={spinSettingsLocked || !newTopicText.trim()}
                  aria-label="Add personal topic"
                  className="min-h-11 min-w-11 shrink-0 touch-manipulation bg-violet-700 p-0 text-white hover:bg-violet-800 disabled:bg-violet-200 disabled:text-violet-400 disabled:opacity-100 sm:min-h-10 sm:min-w-10"
                >
                  <Plus className="size-5" aria-hidden />
                </Button>
              </div>
            </form>

            {customTopics.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-600">Your topics ({customTopics.length})</p>
                <ul className="list-none space-y-1.5">
                  {customTopics.map((topic) => (
                    <li
                      key={topic.id}
                      className="flex items-start gap-1.5 rounded-lg border border-fuchsia-200/50 bg-white/80 py-1.5 pr-1.5 pl-3 text-base leading-snug text-slate-800"
                    >
                      <span className="min-w-0 flex-1 py-1">{topic.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 shrink-0 touch-manipulation p-0 text-slate-500 hover:bg-rose-100/90 hover:text-rose-800 sm:h-8 sm:w-8"
                        disabled={spinSettingsLocked}
                        onClick={() => removePersonalTopic(topic.id)}
                        aria-label={`Remove personal topic: ${topic.text}`}
                        title={spinSettingsLocked ? "Reset the wheel game to edit personal topics" : "Remove"}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

        </TabsContent>
      </Tabs>
    </div>
  );
}
