const BASE_URL = 'http://localhost:5066/api/Auth';

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    async login(phoneNumber: string, password: string): Promise<LoginResponse> {
        const params = new URLSearchParams({ phoneNumber, password });
        const res = await fetch(`${BASE_URL}/login?${params}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.text().catch(() => 'Giriş başarısız.');
            throw new Error(err || 'Giriş başarısız.');
        }
        return res.json();
    },

    async registerOwner(phoneNumber: string, password: string): Promise<void> {
        const params = new URLSearchParams({ phoneNumber, password });
        const res = await fetch(`${BASE_URL}/register-owner?${params}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.text().catch(() => 'Kayıt başarısız.');
            throw new Error(err || 'Kayıt başarısız.');
        }
    },

    async refresh(refreshToken: string): Promise<LoginResponse> {
        const params = new URLSearchParams({ refreshToken });
        const res = await fetch(`${BASE_URL}/refresh?${params}`, { method: 'POST' });
        if (!res.ok) throw new Error('Refresh başarısız.');
        return res.json();
    },
};
