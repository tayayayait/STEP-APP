import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateAggregates,
  getStepHistoryState,
  recordSyncMetadata,
  setStepsForDate,
  subscribeStepHistory,
} from '../services/stepHistoryStore';
import { fetchRemoteSteps, refreshAccessToken, startOAuth } from '../services/stepSyncService';
import { AuthTokens, RewardTransaction, StepAggregates, StepHistoryState, StepSyncProvider, StepSyncStatus, StepSyncTokens } from '../types';
import { createTransactionFromSync, recordRewardTransactions } from '../services/rewardService';

const SYNC_INTERVAL = 5 * 60 * 1000;
const MAX_RETRY = 2;

interface UseStepSyncOptions {
  enabled?: boolean;
  provider?: StepSyncProvider;
  userId?: string | null;
  tokenSnapshot?: AuthTokens | null;
}

interface UseStepSyncResult {
  status: StepSyncStatus;
  aggregates: StepAggregates;
  syncNow: () => Promise<void>;
  history: StepHistoryState;
}

export const useStepSync = (options: UseStepSyncOptions = {}): UseStepSyncResult => {
  const { enabled = true, provider = 'googleFit', userId, tokenSnapshot } = options;
  const initialHistory = getStepHistoryState();
  const [status, setStatus] = useState<StepSyncStatus>({
    provider,
    isSyncing: false,
    lastSyncedAt: initialHistory.lastSyncedAt,
    error: null,
    retryCount: 0,
  });
  const [history, setHistory] = useState<StepHistoryState>(initialHistory);

  const tokensRef = useRef<StepSyncTokens | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeStepHistory((next) => {
      setHistory(next);
      setStatus((prev) => ({ ...prev, lastSyncedAt: next.lastSyncedAt }));
    });
    return () => unsubscribe();
  }, []);

  const ensureTokens = useCallback(async (): Promise<StepSyncTokens> => {
    if (!tokensRef.current) {
      tokensRef.current = await startOAuth(provider);
      return tokensRef.current;
    }

    const expiresAt = new Date(tokensRef.current.expiresAt).getTime();
    if (expiresAt - Date.now() < 60_000) {
      tokensRef.current = await refreshAccessToken(tokensRef.current);
    }

    return tokensRef.current;
  }, [provider]);

  const syncSteps = useCallback(async () => {
    if (!enabled) return;
    setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const tokens = await ensureTokens();
      const since = history.lastSyncedAt ?? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { entries, tokens: nextTokens } = await fetchRemoteSteps(provider, since, tokens);
      tokensRef.current = nextTokens;

      const previousState = getStepHistoryState();
      const rewardTransactions: RewardTransaction[] = [];

      entries.forEach((entry) => setStepsForDate(entry.date, entry.steps, entry.source));
      entries.forEach((entry) => {
        const previousSteps = previousState.entries.find((item) => item.date === entry.date)?.steps ?? 0;
        const delta = entry.steps - previousSteps;
        const transaction = createTransactionFromSync(entry.date, delta, tokenSnapshot);
        if (transaction) {
          rewardTransactions.push(transaction);
        }
      });

      if (rewardTransactions.length > 0 && userId) {
        await recordRewardTransactions(userId, rewardTransactions);
      }

      const syncedAt = new Date().toISOString();
      recordSyncMetadata(syncedAt, provider);

      setStatus({
        provider,
        isSyncing: false,
        lastSyncedAt: syncedAt,
        error: null,
        retryCount: 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '동기화 중 문제가 발생했어요.';
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: message,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [enabled, ensureTokens, history.lastSyncedAt, provider, tokenSnapshot, userId]);

  const syncNow = useCallback(async () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setStatus((prev) => ({ ...prev, retryCount: 0 }));
    await syncSteps();
  }, [syncSteps]);

  useEffect(() => {
    if (!enabled || status.error === null || status.retryCount > MAX_RETRY) return undefined;
    retryTimerRef.current = setTimeout(syncSteps, 2000);
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [enabled, status.error, status.retryCount, syncSteps]);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(syncSteps, SYNC_INTERVAL);
    return () => clearInterval(timer);
  }, [enabled, syncSteps]);

  const aggregates = useMemo<StepAggregates>(() => calculateAggregates(history.entries), [history.entries]);

  return { status, syncNow, aggregates, history };
};
