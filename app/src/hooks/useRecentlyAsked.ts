import { useState, useCallback, useEffect } from 'react';
import type { RecentQuestion } from '../data/mockRecentQuestions';
import { DEFAULT_RECENT_QUESTIONS } from '../data/mockRecentQuestions';

const STORAGE_KEY = 'rovo_recently_asked';
const MAX_ITEMS = 10;

export function useRecentlyAsked() {
  const [questions, setQuestions] = useState<RecentQuestion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_RECENT_QUESTIONS;
    } catch {
      return DEFAULT_RECENT_QUESTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch { /* ignore */ }
  }, [questions]);

  const addQuestion = useCallback((text: string) => {
    setQuestions(prev => {
      const filtered = prev.filter(q => q.text !== text);
      const newItem: RecentQuestion = {
        id: `rq-${Date.now()}`,
        text,
        timestamp: Date.now(),
      };
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { questions, addQuestion };
}
