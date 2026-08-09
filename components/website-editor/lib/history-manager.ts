import { useState, useCallback } from 'react';
import { Block } from './block-types';

export function useHistoryManager(initialBlocks: Block[]) {
  const [history, setHistory] = useState<Block[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentBlocks = history[historyIndex];

  const updateState = useCallback((newBlocks: Block[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex, history.length]);

  return {
    currentBlocks,
    updateState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
