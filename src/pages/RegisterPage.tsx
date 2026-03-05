import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './AuthPages.css';

export function RegisterPage() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!phone || !password || !password2) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }
        if (password !== password2) {
            setError('Şifreler eşleşmiyor.');
            return;
        }
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı.');
            return;
        }
        setLoading(true);
        try {
            await authService.registerOwner(phone, password);
            navigate('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Kayıt başarısız.');
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
                <h1 className="auth-title">Hesap Oluştur</h1>
                <p className="auth-subtitle">Yönetim paneline kayıt olun</p>
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
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password2">Şifre Tekrar</label>
                        <input
                            id="password2"
                            type="password"
                            placeholder="••••••••"
                            value={password2}
                            onChange={e => setPassword2(e.target.value)}
                        />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Kayıt Ol'}
                    </button>
                </form>
                <p className="auth-switch">
                    Zaten hesabın var mı?{' '}
                    <Link to="/login">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}
