import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';

// Güvenli cookie yardımcıları
const REFRESH_COOKIE = 'dashboard_rt';

function setRefreshCookie(token: string) {
  const maxAge = 7 * 24 * 60 * 60; // 7 gün
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

function getRefreshCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearRefreshCookie() {
  document.cookie = `${REFRESH_COOKIE}=; max-age=0; path=/; SameSite=Strict`;
}

interface AuthContextType {
  token: string | null;           // accessToken (memory-only)
  isAuthenticated: boolean;
  isLoading: boolean;             // uygulama açılırken refresh bekleniyor
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // accessToken sadece memory'de — localStorage'a asla yazılmaz
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Sayfa yenilendiğinde cookie'deki refreshToken ile yeni accessToken al
    const rt = getRefreshCookie();
    if (!rt) {
      setIsLoading(false);
      return;
    }

    authService.refresh(rt)
      .then(data => {
        setToken(data.accessToken);
        // Yeni refreshToken geldiyse cookie'yi güncelle
        if (data.refreshToken) setRefreshCookie(data.refreshToken);
      })
      .catch(() => {
        clearRefreshCookie(); // geçersiz refresh token temizle
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    setToken(accessToken);          // memory
    setRefreshCookie(refreshToken); // cookie (SameSite=Strict)
  };

  const logout = () => {
    setToken(null);
    clearRefreshCookie();
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
