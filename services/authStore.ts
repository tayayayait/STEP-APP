import { AuthState, AuthTokens, UserProfile } from '../types';

const STORAGE_KEY = 'rehab_auth_state';

const safeSession = () => (typeof window !== 'undefined' ? window.sessionStorage : undefined);

const loadState = (): AuthState => {
  const storage = safeSession();
  if (!storage) {
    return { tokens: null, profile: null, isAuthenticated: false };
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { tokens: null, profile: null, isAuthenticated: false };
  }
  try {
    const parsed = JSON.parse(raw) as AuthState;
    return {
      tokens: parsed.tokens,
      profile: parsed.profile,
      isAuthenticated: Boolean(parsed.tokens && parsed.profile),
    };
  } catch (error) {
    console.warn('세션 정보를 불러오지 못했습니다.', error);
    storage.removeItem(STORAGE_KEY);
    return { tokens: null, profile: null, isAuthenticated: false };
  }
};

let state: AuthState = loadState();

type Listener = (next: AuthState) => void;
const listeners = new Set<Listener>();

const persistState = () => {
  const storage = safeSession();
  if (!storage) return;
  const payload = JSON.stringify({ tokens: state.tokens, profile: state.profile });
  storage.setItem(STORAGE_KEY, payload);
};

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

export const getAuthState = (): AuthState => state;

export const setAuthState = (next: Partial<AuthState>) => {
  state = {
    ...state,
    ...next,
    isAuthenticated: Boolean((next.tokens ?? state.tokens) && (next.profile ?? state.profile)),
  };
  persistState();
  notify();
};

export const resetAuthState = () => {
  state = { tokens: null, profile: null, isAuthenticated: false };
  const storage = safeSession();
  storage?.removeItem(STORAGE_KEY);
  notify();
};

export const subscribeAuthState = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const updateTokens = (tokens: AuthTokens | null) => setAuthState({ tokens });
export const updateProfile = (profile: UserProfile | null) => setAuthState({ profile });
