export const ACCESS_TOKEN_KEY = "access";
export const REFRESH_TOKEN_KEY = "refresh";

export function clearAuthTokens(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

