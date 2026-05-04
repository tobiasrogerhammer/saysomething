"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { FileUp, Plus, X } from "lucide-react";
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
import type { Topic } from "@/allTopics/topics";
import type { SuggestionTag } from "@/lib/filterTopics";
import { cn } from "@/lib/utils";

const depthSelectedDisplay: Record<1 | 2 | 3, string> = {
  1: "Small talk",
  2: "Personal",
  3: "Meaningful",
};

const singleDepthSelectionHint: Record<1 | 2 | 3, string> = {
  1: "Keeping it light with small-talk topics.",
  2: "Using personal topics with a bit more depth.",
  3: "Going meaningful for deeper conversations.",
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
    <div className="space-y-4 text-slate-800 sm:space-y-5">
      <div className="space-y-2">
        {showHeading ? (
          <p className="text-sm font-semibold tracking-wider text-violet-950 uppercase">Game settings</p>
        ) : null}
        {spinSettingsLocked ? (
          <p className="text-xs text-slate-600">Locked while spin round is active.</p>
        ) : null}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
              <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-violet-950">Safe mode</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={safeMode}
                  onCheckedChange={setSafeMode}
                  aria-label="Toggle safe mode"
                  disabled={spinSettingsLocked}
                  className={safeMode ? "data-checked:bg-emerald-500" : "data-unchecked:bg-rose-400"}
                />
              </div>
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
              {depthLevelsSelected.length === 1
                ? singleDepthSelectionHint[depthLevelsSelected[0] ?? 1]
                : `${depthLevelsSelected.map((level) => depthSelectedDisplay[level]).join(", ")} depth levels currently selected`}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-fuchsia-200/50" />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-wider text-violet-950 uppercase">Game Topics</p>
          <Sheet modal="trap-focus">
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 border-fuchsia-200/70 bg-white/85 px-3 text-sm text-violet-900 hover:bg-violet-50",
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
                  <p className="text-xs font-semibold tracking-wider text-violet-950 uppercase">Topic data source</p>
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
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-md border border-fuchsia-200/70 bg-white/80 px-2.5 py-2 text-sm text-violet-950">
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
                  <p className="text-xs leading-snug text-slate-600">
                    Accepts `.json` (array of strings/topics) or `.txt` (one topic per line).
                  </p>
                  {fileImportError ? <p className="text-xs leading-snug text-rose-700">{fileImportError}</p> : null}
                </div>

                <div className="h-px bg-fuchsia-200/50" />

                <form className="space-y-2" onSubmit={submitBulkTopics}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wider text-violet-950 uppercase">Paste topics</p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="submit"
                        size="lg"
                        className="text-md bg-blue-600 text-white hover:bg-blue-700"
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
                    placeholder={"Paste one topic per line...\nWhat project are you most excited about this quarter?\nWhat helps you recharge after a busy week?"}
                    className="min-h-56 w-full rounded-md border border-fuchsia-200/60 bg-white/90 px-3 py-2 text-sm text-slate-900"
                  />
                  {pasteImportError ? <p className="text-xs leading-snug text-rose-700">{pasteImportError}</p> : null}
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {selectedTopicFileName || pastedTopicsCount > 0 ? (
          <div className="space-y-1">
            {selectedTopicFileName ? (
              <p className="truncate text-xs text-violet-900/80">
                File: <span className="font-medium">{selectedTopicFileName}</span>
              </p>
            ) : null}
            {pastedTopicsCount > 0 ? (
              <p className="text-xs text-violet-900/80">
                Pasted topics active: <span className="font-medium">{pastedTopicsCount}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-violet-900/80">Using default topics</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wider text-violet-950">Add personal topic</p>
        <form className="flex flex-row flex-nowrap items-center gap-2" onSubmit={onSubmitTopic}>
          <input
            value={newTopicText}
            onChange={(event) => setNewTopicText(event.target.value)}
            placeholder="Type your topic suggestion..."
            disabled={spinSettingsLocked}
            className="min-h-11 min-w-0 flex-1 touch-manipulation rounded-md border border-fuchsia-200/60 bg-white/90 px-3 text-base text-slate-900 sm:h-9 sm:min-h-0 sm:text-sm"
          />
          <Button
            type="submit"
            disabled={spinSettingsLocked || !newTopicText.trim()}
            aria-label="Add personal topic"
            className="min-h-11 min-w-11 shrink-0 touch-manipulation border border-fuchsia-200/60 bg-white/90 p-0 text-black hover:bg-white disabled:border-fuchsia-200/60 disabled:bg-white/90 disabled:text-black disabled:opacity-100 sm:h-9 sm:min-h-0 sm:min-w-9"
          >
            <Plus className="size-5 sm:size-4" aria-hidden />
          </Button>
        </form>
      </div>

      <div className="min-w-0 space-y-2">
        <p className="text-sm font-semibold tracking-wider text-violet-950">Current selections</p>
        {spinSettingsLocked ? (
          <p className="text-xs text-slate-600">Locked while spin round is active. Reset the wheel game to change filters.</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
          <span className="text-sm font-semibold text-violet-950">Tags:</span>
          {suggestionTags.length > 0 ? (
            suggestionTags.map((tag) => {
              const colorClass = tagColorClasses[availableTags.indexOf(tag) % tagColorClasses.length];
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
