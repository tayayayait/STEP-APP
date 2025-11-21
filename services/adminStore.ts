import { AdminState, AdminTokens, AdminProfile } from '../types';

const STORAGE_KEY = 'rehab_admin_state';

const safeStorage = () => (typeof window !== 'undefined' ? window.localStorage : undefined);

const loadState = (): AdminState => {
  const storage = safeStorage();
  if (!storage) {
    return { tokens: null, profile: null, isAuthenticated: false };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { tokens: null, profile: null, isAuthenticated: false };
  }

  try {
    const parsed = JSON.parse(raw) as AdminState;
    return {
      tokens: parsed.tokens ?? null,
      profile: parsed.profile ?? null,
      isAuthenticated: Boolean(parsed.tokens && parsed.profile),
    };
  } catch (error) {
    console.warn('관리자 세션을 불러오지 못했습니다.', error);
    storage.removeItem(STORAGE_KEY);
    return { tokens: null, profile: null, isAuthenticated: false };
  }
};

let state: AdminState = loadState();

type Listener = (next: AdminState) => void;

const listeners = new Set<Listener>();

const persistState = () => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

export const getAdminState = (): AdminState => state;

export const subscribeAdminState = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setAdminState = (next: AdminState) => {
  state = { ...next, isAuthenticated: Boolean(next.tokens && next.profile) };
  persistState();
  notify();
};

export const updateAdminSession = (tokens: AdminTokens, profile: AdminProfile) => {
  setAdminState({ tokens, profile, isAuthenticated: true });
};

export const resetAdminState = () => {
  state = { tokens: null, profile: null, isAuthenticated: false };
  persistState();
  notify();
};
