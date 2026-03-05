import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { restaurantService } from '../services/restaurantService';
import type { RestaurantMenuDto } from '../services/restaurantService';
import './HomePage.css';

export function HomePage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<RestaurantMenuDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Kategori Ekleme Modal State'leri
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');

    // Ürün Ekleme Modal State'leri
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [newProductName, setNewProductName] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [newProductPrice, setNewProductPrice] = useState<number | ''>('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadRestaurants = () => {
        if (!token) return;
        setLoading(true);
        restaurantService
            .getMyRestaurants(token)
            .then(setRestaurants)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadRestaurants();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    const handleToggleCategory = async (restaurantId: string, categoryId: string, currentStatus: boolean) => {
        if (!token) return;
        const newStatus = !currentStatus;

        // Optimistic UI update
        setRestaurants(prev =>
            prev.map(r => r.id === restaurantId ? {
                ...r,
                categories: r.categories.map(c =>
                    c.id === categoryId ? { ...c, isActive: newStatus } : c
                )
            } : r)
        );

        try {
            await restaurantService.toggleCategoryStatus(token, restaurantId, categoryId, newStatus);
        } catch (err: any) {
            // Revert on error
            setRestaurants(prev =>
                prev.map(r => r.id === restaurantId ? {
                    ...r,
                    categories: r.categories.map(c =>
                        c.id === categoryId ? { ...c, isActive: currentStatus } : c
                    )
                } : r)
            );
            alert("Kategori güncellenemedi: " + err.message);
        }
    };

    const handleToggleProduct = async (restaurantId: string, categoryId: string, productId: string, currentStatus: boolean) => {
        if (!token) return;
        const newStatus = !currentStatus;

        // Optimistic UI update
        setRestaurants(prev =>
            prev.map(r => r.id === restaurantId ? {
                ...r,
                categories: r.categories.map(c =>
                    c.id === categoryId ? {
                        ...c,
                        products: c.products.map(p =>
                            p.id === productId ? { ...p, isActive: newStatus } : p
                        )
                    } : c
                )
            } : r)
        );

        try {
            await restaurantService.toggleProductStatus(token, productId, newStatus);
        } catch (err: any) {
            // Revert on error
            setRestaurants(prev =>
                prev.map(r => r.id === restaurantId ? {
                    ...r,
                    categories: r.categories.map(c =>
                        c.id === categoryId ? {
                            ...c,
                            products: c.products.map(p =>
                                p.id === productId ? { ...p, isActive: currentStatus } : p
                            )
                        } : c
                    )
                } : r)
            );
            alert("Ürün güncellenemedi: " + err.message);
        }
    };

    const handleOpenCategoryModal = (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId);
        setNewCategoryName('');
        setNewCategoryDesc('');
        setIsCategoryModalOpen(true);
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedRestaurantId) return;

        try {
            setIsSubmitting(true);
            await restaurantService.createCategory(token, selectedRestaurantId, newCategoryName, newCategoryDesc);
            setIsCategoryModalOpen(false);
            loadRestaurants(); // Listeyi yenile
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenProductModal = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setNewProductName('');
        setNewProductDesc('');
        setNewProductPrice('');
        setIsProductModalOpen(true);
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedCategoryId || newProductPrice === '') return;

        try {
            setIsSubmitting(true);
            await restaurantService.createProduct(
                token,
                selectedCategoryId,
                newProductName,
                newProductDesc,
                Number(newProductPrice)
            );
            setIsProductModalOpen(false);
            loadRestaurants(); // Ürün eklendiğinde listeyi yenile
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="home-bg">
            <div className="home-topbar">
                <div className="home-brand">
                    <div className="home-brand-icon">⚡</div>
                    <span className="home-brand-text">CideGetir Owner Dashboard</span>
                </div>
                <div className="home-nav">
                    <button className="nav-btn" onClick={() => navigate('/orders')}>Siparişler</button>
                    <button className="home-logout-btn" onClick={handleLogout}>
                        Çıkış Yap
                    </button>
                </div>
            </div>
            <main className="home-main">
                <div className="home-header">
                    <h1 className="home-welcome">Hoş Geldiniz! 👋</h1>
                    <p className="home-desc">İşletmenizi ve menünüzü buradan yönetebilirsiniz.</p>
                </div>

                {loading && (
                    <div className="dashboard-state">
                        <div className="spinner"></div>
                        <p>Restoran bilgileri yükleniyor...</p>
                    </div>
                )}

                {error && (
                    <div className="dashboard-state error">
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && restaurants.length === 0 && (
                    <div className="dashboard-state">
                        Henüz kayıtlı bir restoranınız bulunmuyor.
                    </div>
                )}

                {!loading && !error && restaurants.map(restaurant => (
                    <div key={restaurant.id} className="restaurant-section">
                        <div className="rs-header">
                            <h2 className="rs-title">🏢 {restaurant.name}</h2>
                            <div className="rs-actions">
                                <button className="add-btn" onClick={() => handleOpenCategoryModal(restaurant.id)}>
                                    + Kategori Ekle
                                </button>
                            </div>
                        </div>

                        <div className="rs-body">
                            {restaurant.categories.length === 0 && (
                                <p className="rs-empty">Menü kategorisi bulunmuyor.</p>
                            )}

                            {restaurant.categories.map(cat => (
                                <div key={cat.id} className={`category-section ${!cat.isActive ? 'is-inactive' : ''}`}>
                                    <div className="cat-header">
                                        <div className="cat-header-left">
                                            <h3 className="cat-title">📁 {cat.name}</h3>
                                            <button
                                                className="add-btn small-btn outline-btn"
                                                onClick={() => handleOpenProductModal(cat.id)}
                                                title="Bu kategoriye yeni ürün ekle"
                                            >
                                                + Ürün Ekle
                                            </button>
                                        </div>
                                        <div className="toggle-group cat-toggle">
                                            <span className={`toggle-label ${cat.isActive ? 'active' : 'inactive'}`}>
                                                {cat.isActive ? 'Görünür' : 'Gizli'}
                                            </span>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={cat.isActive}
                                                    onChange={() => handleToggleCategory(restaurant.id, cat.id, cat.isActive)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {cat.products.length === 0 ? (
                                        <div className="prod-empty-state">
                                            <span>Bu kategoride henüz ürün yok.</span>
                                            <button className="add-btn small-btn" onClick={() => handleOpenProductModal(cat.id)}>+ Ürün Ekle</button>
                                        </div>
                                    ) : (
                                        <div className="products-list">
                                            {cat.products.map(prod => (
                                                <div key={prod.id} className={`product-row ${!prod.isActive ? 'is-inactive' : ''}`}>
                                                    <div className="prod-left">
                                                        {prod.photoUrl && (
                                                            <img src={prod.photoUrl} alt={prod.name} className="product-image" />
                                                        )}
                                                        <div className="prod-info-col">
                                                            <div className="prod-name">{prod.name}</div>
                                                            {prod.description && (
                                                                <div className="prod-desc">{prod.description}</div>
                                                            )}
                                                            <div className="prod-price">{prod.price.toLocaleString('tr-TR')} ₺</div>
                                                        </div>
                                                    </div>
                                                    <div className="prod-right">
                                                        <div className="toggle-group prod-toggle">
                                                            <span className={`toggle-label ${prod.isActive ? 'active' : 'inactive'}`}>
                                                                {prod.isActive ? 'Satışta' : 'Tükendi'}
                                                            </span>
                                                            <label className="toggle-switch small-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={prod.isActive}
                                                                    onChange={() => handleToggleProduct(restaurant.id, cat.id, prod.id, prod.isActive)}
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Kategori Ekleme Modalı */}
                {isCategoryModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Yeni Kategori Ekle</h2>
                            <form onSubmit={handleCreateCategory}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Kategori Adı *</label>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Örn: İçecekler, Tatlılar..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Açıklama (Opsiyonel)</label>
                                        <textarea
                                            value={newCategoryDesc}
                                            onChange={(e) => setNewCategoryDesc(e.target.value)}
                                            placeholder="Kategori hakkında kısa bir açıklama"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsCategoryModalOpen(false)} disabled={isSubmitting}>
                                        İptal
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Ürün Ekleme Modalı */}
                {isProductModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Yeni Ürün Ekle</h2>
                            <form onSubmit={handleCreateProduct}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Ürün Adı *</label>
                                        <input
                                            type="text"
                                            value={newProductName}
                                            onChange={(e) => setNewProductName(e.target.value)}
                                            placeholder="Örn: Karışık Tost"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fiyat (₺) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newProductPrice}
                                            onChange={(e) => setNewProductPrice(e.target.value ? Number(e.target.value) : '')}
                                            placeholder="Örn: 150"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Açıklama / İçerik (Opsiyonel)</label>
                                        <textarea
                                            value={newProductDesc}
                                            onChange={(e) => setNewProductDesc(e.target.value)}
                                            placeholder="Ürün içeriğini veya açıklamasını giriniz"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsProductModalOpen(false)} disabled={isSubmitting}>
                                        İptal
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
