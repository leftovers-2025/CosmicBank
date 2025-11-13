export interface VirtueAction {
  id: string;
  description: string;
  virtue: number;
  date: number;
}

export interface VirtueHistoryData {
  balance: number;
  actions: VirtueAction[];
}

const COOKIE_NAME = 'virtue_history';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1年

/**
 * CookieからポイントデータをJSONとして読み込む
 */
export function loadVirtueDataFromCookie(): VirtueHistoryData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const virtueCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${COOKIE_NAME}=`)
  );

  if (!virtueCookie) {
    return null;
  }

  try {
    const cookieValue = virtueCookie.split('=')[1];
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Cookie読み込みエラー:', error);
    return null;
  }
}

/**
 * ポイントデータをCookieにJSONとして保存
 */
export function saveVirtueDataToCookie(data: VirtueHistoryData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const jsonString = JSON.stringify(data);
    const encoded = encodeURIComponent(jsonString);
    document.cookie = `${COOKIE_NAME}=${encoded}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Cookie保存エラー:', error);
  }
}

/**
 * Cookieをクリア
 */
export function clearVirtueDataCookie(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
}
