import { AuthApiSchema, AuthTokens, UserProfile } from '../types';

const apiSchema: AuthApiSchema = {
  login: {
    method: 'POST',
    path: '/api/auth/login',
    request: { phoneNumber: '' },
    response: { userId: '', tokens: { accessToken: '', refreshToken: '', expiresAt: '' } },
  },
  saveProfile: {
    method: 'PUT',
    path: '/api/users/:userId/profile',
    request: {
      id: '',
      name: '',
      age: 0,
      surgeryArea: '',
      phoneNumber: '',
      targetSteps: 0,
    },
    response: {
      id: '',
      name: '',
      age: 0,
      surgeryArea: '',
      phoneNumber: '',
      targetSteps: 0,
    },
  },
  getProfile: {
    method: 'GET',
    path: '/api/users/:userId/profile',
    request: undefined as never,
    response: {
      id: '',
      name: '',
      age: 0,
      surgeryArea: '',
      phoneNumber: '',
      targetSteps: 0,
    },
  },
  verify: {
    method: 'POST',
    path: '/api/auth/verify',
    request: { accessToken: '' },
    response: { valid: false },
  },
};

const mockProfileStore = new Map<string, UserProfile>();

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const generateTokens = (): AuthTokens => {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  return {
    accessToken: `access-${crypto.randomUUID()}`,
    refreshToken: `refresh-${crypto.randomUUID()}`,
    expiresAt,
  };
};

export interface AuthCredentials {
  phoneNumber: string;
}

export interface AuthResult {
  userId: string;
  tokens: AuthTokens;
}

export const getAuthApiSchema = (): AuthApiSchema => apiSchema;

export const authenticate = async (credentials: AuthCredentials): Promise<AuthResult> => {
  await delay();

  const sanitizedNumber = credentials.phoneNumber.replace(/\D/g, '');
  const userId = `user-${sanitizedNumber.slice(-8)}`;

  return {
    userId,
    tokens: generateTokens(),
  };
};

export const verifySession = async (tokens: AuthTokens | null): Promise<boolean> => {
  if (!tokens) return false;
  await delay();
  return new Date(tokens.expiresAt).getTime() > Date.now();
};

export const saveProfile = async (profile: UserProfile, tokens: AuthTokens): Promise<UserProfile> => {
  await delay();
  const tokenValid = await verifySession(tokens);
  if (!tokenValid) {
    throw new Error('인증 정보가 만료되었습니다. 다시 로그인해주세요.');
  }
  mockProfileStore.set(profile.id, profile);
  return profile;
};

export const fetchProfile = async (userId: string, tokens: AuthTokens): Promise<UserProfile | null> => {
  await delay();
  const tokenValid = await verifySession(tokens);
  if (!tokenValid) {
    throw new Error('세션이 만료되었습니다.');
  }
  return mockProfileStore.get(userId) ?? null;
};
