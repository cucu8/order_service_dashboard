const BASE_URL = 'http://localhost:5066/api';

export const OrderStatus = {
    Pending: 1,
    Accepted: 2,
    Preparing: 3,
    Ready: 4,
    OnTheWay: 5,
    Delivered: 6,
    Cancelled: 7
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentStatus = {
    Pending: 1,
    Paid: 2,
    Failed: 3
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface OrderItemDto {
    id: string;
    orderId: string;
    productId: string;
    product: any | null; // Assuming it can be null based on your JSON
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    createdAt: string;
}

export interface OrderDto {
    id: string;
    customerId: string;
    customer: any | null;
    restaurantId: string;
    restaurant: any | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    note: string | null;
    totalAmount: number;
    orderItems: OrderItemDto[];
    courierId: string | null;
    courier: any | null;
    createdAt: string;
    updatedAt: string;
}

export const orderService = {
    // API Call to get orders by restaurant
    async getRestaurantOrders(token: string, restaurantId: string): Promise<OrderDto[]> {
        const res = await fetch(`${BASE_URL}/Order/restaurant/${restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Sipariş bilgileri yüklenemedi.');
        return res.json();
    },

    // Optional: Update an order's status
    async updateOrderStatus(token: string, id: string, status: OrderStatus): Promise<void> {
        const res = await fetch(`${BASE_URL}/Order/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Sipariş durumu güncellenirken hata oluştu.');
    }
};
