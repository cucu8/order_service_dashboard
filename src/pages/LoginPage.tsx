import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './AuthPages.css';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!phone || !password) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }
        setLoading(true);
        try {
            const data = await authService.login(phone, password);
            login(data.accessToken, data.refreshToken);
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Giriş başarısız.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-glass">
                <div className="auth-logo">
                    <div className="auth-logo-icon">⚡</div>
                    <span className="auth-logo-text">CideGetir</span>
                    <span className="auth-logo-badge">Dashboard</span>
                </div>
                <h1 className="auth-title">Hoş Geldiniz</h1>
                <p className="auth-subtitle">Yönetim paneline giriş yapın</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="phone">Telefon Numarası</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="05xxxxxxxxx"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            autoComplete="tel"
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Şifre</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Giriş Yap'}
                    </button>
                </form>
                <p className="auth-switch">
                    Hesabın yok mu?{' '}
                    <Link to="/register">Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
}
