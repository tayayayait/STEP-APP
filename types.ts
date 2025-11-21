export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  PERMISSIONS = 'PERMISSIONS',
  DASHBOARD = 'DASHBOARD',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  surgeryArea: string;
  targetSteps: number;
  phoneNumber: string;
}

export interface DailyLog {
  date: string;
  steps: number;
  lastSynced: string;
}

export type StepSyncProvider = 'googleFit' | 'healthKit';

export interface StepSyncTokens {
  provider: StepSyncProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface StepEntry {
  date: string;
  steps: number;
  source: 'manual' | 'sync';
}

export interface StepHistoryState {
  entries: StepEntry[];
  lastSyncedAt: string | null;
  lastProvider: StepSyncProvider | null;
}

export interface StepAggregates {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface StepSyncStatus {
  provider: StepSyncProvider;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  retryCount: number;
}

export interface EncouragementResponse {
  message: string;
  tone: 'celebratory' | 'encouraging' | 'gentle';
}

export interface AuthState {
  tokens: AuthTokens | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

export interface AuthApiSchema {
  login: {
    method: 'POST';
    path: '/api/auth/login';
    request: { phoneNumber: string };
    response: { userId: string; tokens: AuthTokens };
  };
  saveProfile: {
    method: 'PUT';
    path: '/api/users/:userId/profile';
    request: UserProfile;
    response: UserProfile;
  };
  getProfile: {
    method: 'GET';
    path: '/api/users/:userId/profile';
    request: never;
    response: UserProfile;
  };
  verify: {
    method: 'POST';
    path: '/api/auth/verify';
    request: { accessToken: string };
    response: { valid: boolean };
  };
}

export interface RewardTransactionMetadata {
  source: 'sync' | 'manual';
  tokenSnapshot?: { accessToken: string; expiresAt: string };
}

export interface RewardTransaction {
  id: string;
  date: string;
  label: string;
  points: number;
  stepsDelta: number;
  type: 'earn' | 'spend';
  createdAt: string;
  metadata?: RewardTransactionMetadata;
}

export interface RewardState {
  balance: number;
  transactions: RewardTransaction[];
}

export type VideoCategory = '초기 재활' | '스트레칭' | '호흡/안정' | '균형 강화';

export interface VideoMeta {
  id: string;
  title: string;
  category: VideoCategory;
  url: string;
  description?: string;
}
