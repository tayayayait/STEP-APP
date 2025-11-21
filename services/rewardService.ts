import { AuthTokens, RewardState, RewardTransaction } from '../types';

export const POINTS_PER_1000_STEPS = 8;

const STORAGE_KEY = 'rehab_reward_ledger';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const safeStorage = () => (typeof window !== 'undefined' ? window.localStorage : undefined);

const loadLedger = (): Record<string, RewardState> => {
  const storage = safeStorage();
  if (!storage) return {};

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, RewardState>;
    return parsed;
  } catch (error) {
    console.warn('포인트 내역을 불러오지 못했습니다.', error);
    storage.removeItem(STORAGE_KEY);
    return {};
  }
};

let ledger: Record<string, RewardState> = loadLedger();

const listeners = new Map<string, Set<(state: RewardState) => void>>();

const persistLedger = () => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(ledger));
};

const notify = (userId: string) => {
  const userListeners = listeners.get(userId);
  if (!userListeners) return;
  const state = getRewardState(userId);
  userListeners.forEach((listener) => listener(state));
};

export const calculatePointsFromSteps = (stepsDelta: number): number => {
  const absolute = Math.abs(stepsDelta);
  const buckets = Math.floor(absolute / 1000);
  if (buckets === 0) return 0;
  const direction = stepsDelta >= 0 ? 1 : -1;
  return buckets * POINTS_PER_1000_STEPS * direction;
};

export const createTransactionFromSync = (
  date: string,
  stepsDelta: number,
  tokens?: AuthTokens | null,
): RewardTransaction | null => {
  const points = calculatePointsFromSteps(stepsDelta);
  if (points === 0) return null;

  return {
    id: `txn-${crypto.randomUUID()}`,
    date,
    label: stepsDelta >= 0 ? '걸음 동기화 적립' : '걸음 조정 차감',
    points,
    stepsDelta,
    type: points >= 0 ? 'earn' : 'spend',
    createdAt: new Date().toISOString(),
    metadata: {
      source: 'sync',
      tokenSnapshot: tokens ? { accessToken: tokens.accessToken, expiresAt: tokens.expiresAt } : undefined,
    },
  };
};

export const getRewardState = (userId: string): RewardState => ledger[userId] ?? { balance: 0, transactions: [] };

export const subscribeRewardState = (userId: string, listener: (state: RewardState) => void) => {
  const userListeners = listeners.get(userId) ?? new Set<(state: RewardState) => void>();
  userListeners.add(listener);
  listeners.set(userId, userListeners);
  return () => {
    userListeners.delete(listener);
  };
};

export const recordRewardTransactions = async (
  userId: string,
  transactions: RewardTransaction[],
): Promise<RewardState> => {
  if (!userId) {
    throw new Error('사용자 정보가 필요합니다.');
  }

  await delay();

  const current = getRewardState(userId);
  const mergedTransactions = [...transactions, ...current.transactions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const balance = mergedTransactions.reduce((sum, txn) => sum + txn.points, 0);

  ledger = {
    ...ledger,
    [userId]: {
      balance,
      transactions: mergedTransactions,
    },
  };

  persistLedger();
  notify(userId);

  return ledger[userId];
};

export const fetchRewardState = async (userId: string): Promise<RewardState> => {
  await delay(200);
  return getRewardState(userId);
};
