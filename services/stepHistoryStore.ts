import { StepAggregates, StepEntry, StepHistoryState, StepSyncProvider } from '../types';

const STORAGE_KEY = 'rehab_step_history';

const safeStorage = () => (typeof window !== 'undefined' ? window.localStorage : undefined);

const loadState = (): StepHistoryState => {
  const storage = safeStorage();
  if (!storage) {
    return { entries: [], lastSyncedAt: null, lastProvider: null };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { entries: [], lastSyncedAt: null, lastProvider: null };
  }

  try {
    const parsed = JSON.parse(raw) as StepHistoryState;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      lastProvider: parsed.lastProvider ?? null,
    };
  } catch (error) {
    console.warn('걸음 기록을 불러오지 못했습니다.', error);
    storage.removeItem(STORAGE_KEY);
    return { entries: [], lastSyncedAt: null, lastProvider: null };
  }
};

let state: StepHistoryState = loadState();

type Listener = (next: StepHistoryState) => void;

const listeners = new Set<Listener>();

const persistState = () => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

export const getStepHistoryState = (): StepHistoryState => state;

export const subscribeStepHistory = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const upsertEntry = (entry: StepEntry) => {
  const existingIndex = state.entries.findIndex((item) => item.date === entry.date);
  if (existingIndex >= 0) {
    state.entries[existingIndex] = { ...state.entries[existingIndex], ...entry };
  } else {
    state.entries = [...state.entries, entry];
  }
};

export const setStepsForDate = (date: string, steps: number, source: StepEntry['source'] = 'manual') => {
  state = {
    ...state,
    entries: [...state.entries],
  };
  upsertEntry({ date, steps, source });
  persistState();
  notify();
};

export const incrementStepsForDate = (date: string, delta: number, source: StepEntry['source'] = 'manual') => {
  const current = state.entries.find((entry) => entry.date === date)?.steps ?? 0;
  setStepsForDate(date, Math.max(0, current + delta), source);
};

export const recordSyncMetadata = (timestamp: string, provider: StepSyncProvider) => {
  state = {
    ...state,
    lastSyncedAt: timestamp,
    lastProvider: provider,
  };
  persistState();
  notify();
};

export const getStepsForDate = (date: string) => state.entries.find((entry) => entry.date === date)?.steps ?? 0;

const withinDays = (date: Date, reference: Date, days: number) => {
  const diff = reference.getTime() - date.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

export const calculateAggregates = (entries: StepEntry[], referenceDate = new Date()): StepAggregates => {
  const todayKey = getDateKey(referenceDate);
  const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

  const aggregates: StepAggregates = {
    daily: 0,
    weekly: 0,
    monthly: 0,
  };

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    if (entry.date === todayKey) {
      aggregates.daily += entry.steps;
    }
    if (withinDays(entryDate, referenceDate, 6)) {
      aggregates.weekly += entry.steps;
    }
    if (entryDate >= startOfMonth && entryDate <= referenceDate) {
      aggregates.monthly += entry.steps;
    }
  });

  return aggregates;
};

export const getAggregates = (referenceDate = new Date()): StepAggregates =>
  calculateAggregates(state.entries, referenceDate);
