import {
  AdminProfile,
  AdminRegistrationPayload,
  AdminTokens,
  AdminUserRow,
  QrRegistrationPayload,
} from '../types';

const USERS_STORAGE_KEY = 'rehab_admin_users';

const safeStorage = () => (typeof window !== 'undefined' ? window.localStorage : undefined);

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const loadUsers = (): AdminUserRow[] => {
  const storage = safeStorage();
  if (!storage) return getSeedUsers();

  const raw = storage.getItem(USERS_STORAGE_KEY);
  if (!raw) return getSeedUsers();

  try {
    const parsed = JSON.parse(raw) as AdminUserRow[];
    if (Array.isArray(parsed)) {
      return parsed.map((user) => ({ ...user }));
    }
    return getSeedUsers();
  } catch (error) {
    console.warn('사용자 목록을 불러오지 못했습니다.', error);
    storage.removeItem(USERS_STORAGE_KEY);
    return getSeedUsers();
  }
};

const persistUsers = (users: AdminUserRow[]) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const generateAdminTokens = (): AdminTokens => ({
  accessToken: `admin-${crypto.randomUUID()}`,
  role: 'admin',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
});

const getSeedUsers = (): AdminUserRow[] => [
  {
    id: 'user-001',
    name: '김재활',
    phoneNumber: '010-1234-5678',
    steps: 8500,
    points: 320,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    lastActiveAt: new Date().toISOString(),
    registrationMethod: 'phone',
  },
  {
    id: 'user-002',
    name: '이회복',
    phoneNumber: '010-2222-3333',
    steps: 4500,
    points: 190,
    registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    registrationMethod: 'qr',
  },
];

let userStore: AdminUserRow[] = loadUsers();

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminAuthResult {
  tokens: AdminTokens;
  profile: AdminProfile;
}

const ensureAuthenticated = async (tokens: AdminTokens | null) => {
  const valid = await verifyAdminSession(tokens);
  if (!valid) {
    throw new Error('관리자 인증이 필요합니다. 다시 로그인해주세요.');
  }
};

export const adminLogin = async (credentials: AdminCredentials): Promise<AdminAuthResult> => {
  await delay();

  const normalizedEmail = credentials.email.trim().toLowerCase();
  const passwordOk = credentials.password === 'admin123';

  if (!normalizedEmail || !passwordOk) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const profile: AdminProfile = {
    id: 'admin-001',
    name: '병동 관리자',
    email: normalizedEmail,
  };

  return { profile, tokens: generateAdminTokens() };
};

export const verifyAdminSession = async (tokens: AdminTokens | null): Promise<boolean> => {
  if (!tokens || tokens.role !== 'admin') return false;
  await delay(150);
  return new Date(tokens.expiresAt).getTime() > Date.now();
};

export const fetchAdminUsers = async (tokens: AdminTokens | null): Promise<AdminUserRow[]> => {
  await ensureAuthenticated(tokens);
  await delay();
  return [...userStore].sort((a, b) => b.steps - a.steps);
};

export const registerUserForAdmin = async (
  payload: AdminRegistrationPayload,
  tokens: AdminTokens | null,
): Promise<AdminUserRow> => {
  await ensureAuthenticated(tokens);
  await delay();

  const now = new Date().toISOString();
  const newUser: AdminUserRow = {
    id: `user-${crypto.randomUUID().slice(0, 8)}`,
    name: payload.name,
    phoneNumber: payload.phoneNumber,
    steps: payload.initialSteps ?? 0,
    points: payload.initialPoints ?? Math.max(10, Math.round((payload.initialSteps ?? 0) / 20)),
    registeredAt: now,
    lastActiveAt: now,
    registrationMethod: payload.registrationMethod,
  };

  userStore = [newUser, ...userStore];
  persistUsers(userStore);
  return newUser;
};

export const registerUserFromQr = async (
  payload: QrRegistrationPayload,
  tokens: AdminTokens | null,
): Promise<AdminUserRow> =>
  registerUserForAdmin(
    {
      ...payload,
      registrationMethod: 'qr',
    },
    tokens,
  );

export const buildQrRegistrationPayload = (payload: QrRegistrationPayload): string =>
  JSON.stringify({
    ...payload,
    issuedAt: new Date().toISOString(),
  });

export const parseQrRegistrationPayload = (value: string): QrRegistrationPayload => {
  const parsed = JSON.parse(value) as Partial<QrRegistrationPayload>;
  if (!parsed.phoneNumber) {
    throw new Error('QR 정보에 전화번호가 없습니다.');
  }
  return {
    name: parsed.name ?? '미기입',
    phoneNumber: parsed.phoneNumber,
    initialSteps: parsed.initialSteps ?? 0,
    initialPoints: parsed.initialPoints ?? 0,
  };
};

export const getStepPointSnapshot = async (tokens: AdminTokens | null) => {
  await ensureAuthenticated(tokens);
  await delay(120);
  const totalSteps = userStore.reduce((sum, user) => sum + user.steps, 0);
  const totalPoints = userStore.reduce((sum, user) => sum + user.points, 0);
  return { totalSteps, totalPoints, userCount: userStore.length };
};
