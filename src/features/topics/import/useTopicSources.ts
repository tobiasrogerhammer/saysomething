"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import type { Topic } from "@/allTopics/topics";
import { parseUploadedTopics } from "./parseUploadedTopics";
import {
  mergeTopicSources,
  readStoredTopicSources,
  TOPIC_SOURCES_STORAGE_KEY,
  type StoredTopicSources,
} from "./topicSourcesStorage";

type UseTopicSourcesArgs = {
  onTopicPoolReset: () => void;
};

type UseTopicSourcesResult = {
  activeTopics: Topic[];
  selectedTopicFileName: string | null;
  pastedTopicsCount: number;
  pastedTopicsDraft: string;
  setPastedTopicsDraft: (value: string) => void;
  lastAppliedPastedRaw: string;
  fileImportError: string | null;
  pasteImportError: string | null;
  importTopicFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearTopicFile: () => void;
  savePastedTopics: () => void;
  clearPastedTopics: () => void;
};

export function useTopicSources({ onTopicPoolReset }: UseTopicSourcesArgs): UseTopicSourcesResult {
  const [storedTopicSources] = useState<StoredTopicSources>(readStoredTopicSources);
  const [activeTopics, setActiveTopics] = useState<Topic[]>(() =>
    mergeTopicSources(storedTopicSources.fileTopics, storedTopicSources.pastedTopics),
  );
  const [fileTopics, setFileTopics] = useState<Topic[] | null>(storedTopicSources.fileTopics);
  const [selectedTopicFileName, setSelectedTopicFileName] = useState<string | null>(storedTopicSources.selectedTopicFileName);
  const [pastedTopics, setPastedTopics] = useState<Topic[] | null>(storedTopicSources.pastedTopics);
  const [fileImportError, setFileImportError] = useState<string | null>(null);
  const [pasteImportError, setPasteImportError] = useState<string | null>(null);
  const [pastedTopicsDraft, setPastedTopicsDraft] = useState(storedTopicSources.pastedTopicsDraft);
  const [lastAppliedPastedRaw, setLastAppliedPastedRaw] = useState(storedTopicSources.lastAppliedPastedRaw);

  useEffect(() => {
    if (!fileTopics && !pastedTopics && !pastedTopicsDraft.trim() && !lastAppliedPastedRaw) {
      window.localStorage.removeItem(TOPIC_SOURCES_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      TOPIC_SOURCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        fileTopics,
        selectedTopicFileName,
        pastedTopics,
        pastedTopicsDraft,
        lastAppliedPastedRaw,
      }),
    );
  }, [fileTopics, selectedTopicFileName, pastedTopics, pastedTopicsDraft, lastAppliedPastedRaw]);

  const importTopicFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setFileImportError(null);

    const fileInput = event.currentTarget;
    const file = fileInput.files?.[0];
    if (!file) {
      setFileImportError("Please select a file first.");
      return;
    }

    try {
      const content = await file.text();
      const importedTopics = parseUploadedTopics(content);
      setFileTopics(importedTopics);
      setSelectedTopicFileName(file.name);
      setActiveTopics(mergeTopicSources(importedTopics, pastedTopics));
      onTopicPoolReset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse uploaded topics.";
      setFileImportError(message);
    }
  };

  const clearTopicFile = () => {
    setFileImportError(null);
    setFileTopics(null);
    setSelectedTopicFileName(null);
    setActiveTopics(mergeTopicSources(null, pastedTopics));
    onTopicPoolReset();
  };

  const clearPastedTopics = () => {
    setPasteImportError(null);
    setPastedTopicsDraft("");
    setLastAppliedPastedRaw("");
    setPastedTopics(null);
    setActiveTopics(mergeTopicSources(fileTopics, null));
    onTopicPoolReset();
  };

  const importTopicText = (raw: string) => {
    setPasteImportError(null);
    if (!raw.trim()) {
      setPastedTopics(null);
      setLastAppliedPastedRaw("");
      setActiveTopics(mergeTopicSources(fileTopics, null));
      onTopicPoolReset();
      return;
    }

    try {
      const importedTopics = parseUploadedTopics(raw);
      setPastedTopics(importedTopics);
      setLastAppliedPastedRaw(raw);
      setActiveTopics(mergeTopicSources(fileTopics, importedTopics));
      onTopicPoolReset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse pasted topics.";
      setPasteImportError(message);
    }
  };

  const savePastedTopics = () => {
    importTopicText(pastedTopicsDraft);
  };

  return {
    activeTopics,
    selectedTopicFileName,
    pastedTopicsCount: pastedTopics?.length ?? 0,
    pastedTopicsDraft,
    setPastedTopicsDraft,
    lastAppliedPastedRaw,
    fileImportError,
    pasteImportError,
    importTopicFile,
    clearTopicFile,
    savePastedTopics,
    clearPastedTopics,
  };
}
