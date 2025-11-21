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
