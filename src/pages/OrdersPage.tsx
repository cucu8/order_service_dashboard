import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { restaurantService } from '../services/restaurantService';
import type { RestaurantMenuDto } from '../services/restaurantService';
import { orderService, OrderStatus, PaymentStatus } from '../services/orderService';
import type { OrderDto, OrderItemDto } from '../services/orderService';
import * as signalR from '@microsoft/signalr';
import './OrdersPage.css';

export function OrdersPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<RestaurantMenuDto[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!token || !selectedRestaurantId) return;

        // Build connection
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5066/hubs/orders", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on("NewOrder", (order: OrderDto) => {
            console.log("Yeni sipariş geldi:", order);
            // Listeyi yenile
            loadOrders(selectedRestaurantId);
            // Görsel bildirim
            showToast(`🔔 Yeni Sipariş: #${order.id.slice(0, 8)}`);
            // Ses bildirimi
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.play().catch(e => console.log("Ses çalınamadı:", e));
        });

        connection.start()
            .then(() => {
                console.log("SignalR bağlantısı kuruldu");
                //backenddeki OrdersHub içindeki bu method çalıştırılıyor:
                //Dashboard (restoran paneli) önce gruba katılıyor
                connection.invoke("JoinRestaurantGroup", selectedRestaurantId);
                connectionRef.current = connection;
            })
            .catch(err => console.error("SignalR hatası:", err));

        return () => {
            if (connectionRef.current) {
                connectionRef.current.invoke("LeaveRestaurantGroup", selectedRestaurantId);
                connectionRef.current.stop();
            }
        };
    }, [token, selectedRestaurantId]);

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const myRestaurants = await restaurantService.getMyRestaurants(token);
            setRestaurants(myRestaurants);
            if (myRestaurants.length > 0) {
                setSelectedRestaurantId(myRestaurants[0].id);
            } else {
                setLoading(false);
            }
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    const loadOrders = async (restaurantId: string) => {
        if (!token) return;
        setLoading(true);
        try {
            const fetchedOrders = await orderService.getRestaurantOrders(token, restaurantId);
            setOrders(fetchedOrders);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    useEffect(() => {
        if (selectedRestaurantId) {
            loadOrders(selectedRestaurantId);
        }
    }, [selectedRestaurantId]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusLabel = (status: OrderStatus) => {
        const labels: Record<number, string> = {
            [OrderStatus.Pending]: 'Beklemede',
            [OrderStatus.Accepted]: 'Onaylandı',
            [OrderStatus.Preparing]: 'Hazırlanıyor',
            [OrderStatus.Ready]: 'Hazır',
            [OrderStatus.OnTheWay]: 'Yolda',
            [OrderStatus.Delivered]: 'Teslim Edildi',
            [OrderStatus.Cancelled]: 'İptal Edildi',
        };
        return labels[status] || 'Bilinmiyor';
    };

    const getStatusClass = (status: OrderStatus) => {
        const classes: Record<number, string> = {
            [OrderStatus.Pending]: 'status-pending',
            [OrderStatus.Accepted]: 'status-accepted',
            [OrderStatus.Preparing]: 'status-preparing',
            [OrderStatus.Ready]: 'status-ready',
            [OrderStatus.OnTheWay]: 'status-ontheway',
            [OrderStatus.Delivered]: 'status-delivered',
            [OrderStatus.Cancelled]: 'status-cancelled',
        };
        return classes[status] || '';
    };

    const getPaymentStatusLabel = (status: PaymentStatus) => {
        const labels: Record<number, string> = {
            [PaymentStatus.Pending]: 'Ödeme Bekliyor',
            [PaymentStatus.Paid]: 'Ödendi',
            [PaymentStatus.Failed]: 'Ödeme Başarısız',
        };
        return labels[status] || 'Bilinmiyor';
    };

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        if (!token) return;
        try {
            await orderService.updateOrderStatus(token, orderId, newStatus);
            if (selectedRestaurantId) loadOrders(selectedRestaurantId);
        } catch (err: any) {
            alert("Durum güncellenemedi: " + err.message);
        }
    };

    return (
        <div className="orders-bg">
            <div className="orders-topbar">
                <div className="orders-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="orders-brand-icon">⚡</div>
                    <span className="orders-brand-text">CideGetir Orders</span>
                </div>
                <div className="orders-nav">
                    <button className="nav-btn" onClick={() => navigate('/')}>Menü Yönetimi</button>
                    <button className="home-logout-btn" onClick={handleLogout}>Çıkış Yap</button>
                </div>
            </div>

            <main className="orders-main">
                <div className="orders-header">
                    <h1 className="orders-welcome">Sipariş Yönetimi 📋</h1>
                    <div className="restaurant-selector">
                        <label>Restoran Seçin:</label>
                        <select
                            value={selectedRestaurantId || ''}
                            onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        >
                            {restaurants.map((r: RestaurantMenuDto) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="dashboard-state">
                        <div className="spinner"></div>
                        <p>Siparişler yükleniyor...</p>
                    </div>
                )}

                {error && (
                    <div className="dashboard-state error">
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="dashboard-state">
                        Henüz sipariş bulunmuyor.
                    </div>
                )}

                <div className="orders-list">
                    {!loading && !error && orders.map((order: OrderDto) => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-id-group">
                                    <span className="order-id-label">Sipariş ID:</span>
                                    <span className="order-id-value">#{order.id.slice(0, 8)}</span>
                                </div>
                                <div className={`status-badge ${getStatusClass(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </div>
                            </div>

                            <div className="order-card-body">
                                <div className="order-items-list">
                                    {order.orderItems.map((item: OrderItemDto) => (
                                        <div key={item.id} className="order-item-row">
                                            <span className="item-qty">{item.quantity}x</span>
                                            <span className="item-name">{item.productName}</span>
                                            <span className="item-price">{(item.totalPrice).toLocaleString('tr-TR')} ₺</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-meta">
                                    <div className="meta-row">
                                        <span>Ödeme Durumu:</span>
                                        <span className={`payment-status ps-${order.paymentStatus}`}>
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </div>
                                    <div className="meta-row">
                                        <span>Tarih:</span>
                                        <span>{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <div className="total-amount">
                                    <span className="total-label">Toplam:</span>
                                    <span className="total-value">{order.totalAmount.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="order-actions">
                                    {order.status === OrderStatus.Pending && (
                                        <button
                                            className="action-btn accept-btn"
                                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Accepted)}
                                        >
                                            Onayla
                                        </button>
                                    )}
                                    {order.status === OrderStatus.Accepted && (
                                        <button
                                            className="action-btn prepare-btn"
                                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Preparing)}
                                        >
                                            Hazırla
                                        </button>
                                    )}
                                    {order.status === OrderStatus.Preparing && (
                                        <button
                                            className="action-btn ready-btn"
                                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Ready)}
                                        >
                                            Hazırlandı
                                        </button>
                                    )}
                                    {order.status < OrderStatus.Delivered && order.status !== OrderStatus.Cancelled && (
                                        <button
                                            className="action-btn cancel-btn"
                                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Cancelled)}
                                        >
                                            İptal Et
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Toast */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
