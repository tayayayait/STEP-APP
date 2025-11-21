export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  PERMISSIONS = 'PERMISSIONS',
  DASHBOARD = 'DASHBOARD',
}

export interface User {
  id: string;
  name: string;
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