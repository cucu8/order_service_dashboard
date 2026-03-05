import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export function HomePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="home-bg">
            <div className="home-topbar">
                <div className="home-brand">
                    <div className="home-brand-icon">⚡</div>
                    <span className="home-brand-text">CideGetir Dashboard</span>
                </div>
                <button className="home-logout-btn" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </div>
            <main className="home-main">
                <h1 className="home-welcome">Hoş Geldiniz! 👋</h1>
                <p className="home-desc">Yönetim paneline başarıyla giriş yaptınız.</p>
                <div className="home-cards">
                    <div className="home-card">
                        <div className="home-card-icon">📦</div>
                        <h3>Siparişler</h3>
                        <p>Tüm siparişleri yönetin</p>
                    </div>
                    <div className="home-card">
                        <div className="home-card-icon">🍽️</div>
                        <h3>Menü</h3>
                        <p>Ürün ve kategori yönetimi</p>
                    </div>
                    <div className="home-card">
                        <div className="home-card-icon">👤</div>
                        <h3>Kullanıcılar</h3>
                        <p>Müşteri ve personel yönetimi</p>
                    </div>
                    <div className="home-card">
                        <div className="home-card-icon">📊</div>
                        <h3>Raporlar</h3>
                        <p>Satış ve analiz raporları</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
