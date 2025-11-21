import { StepEntry, StepSyncProvider, StepSyncTokens } from '../types';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const ACCESS_TOKEN_LIFETIME = 1000 * 60 * 30;

const generateTokens = (provider: StepSyncProvider): StepSyncTokens => {
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_LIFETIME).toISOString();
  return {
    provider,
    accessToken: `${provider}-access-${crypto.randomUUID()}`,
    refreshToken: `${provider}-refresh-${crypto.randomUUID()}`,
    expiresAt,
  };
};

export const startOAuth = async (provider: StepSyncProvider): Promise<StepSyncTokens> => {
  await delay(500);
  return generateTokens(provider);
};

export const refreshAccessToken = async (tokens: StepSyncTokens): Promise<StepSyncTokens> => {
  await delay(350);
  return generateTokens(tokens.provider);
};

export interface SyncResponse {
  entries: StepEntry[];
  tokens: StepSyncTokens;
}

const randomStep = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getDateString = (date: Date) => date.toISOString().split('T')[0];

export const fetchRemoteSteps = async (
  provider: StepSyncProvider,
  since: string,
  tokens: StepSyncTokens,
): Promise<SyncResponse> => {
  await delay(400);

  if (new Date(tokens.expiresAt).getTime() <= Date.now()) {
    tokens = await refreshAccessToken(tokens);
  }

  // Simulate an intermittent network error
  if (Math.random() < 0.1) {
    throw new Error('건강 데이터 공급자와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  const start = new Date(since);
  const today = new Date();
  const entries: StepEntry[] = [];

  for (
    let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    cursor <= today;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    entries.push({
      date: getDateString(cursor),
      steps: randomStep(1200, 4200),
      source: 'sync',
    });
  }

  return { entries, tokens };
};
