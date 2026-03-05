const BASE_URL = 'http://localhost:5066/api';

export interface ProductDto {
    id: string;
    name: string;
    description?: string;
    photoUrl?: string;
    price: number;
    isActive: boolean;
}

export interface MenuCategoryDto {
    id: string;
    name: string;
    isActive: boolean;
    products: ProductDto[];
}

export interface RestaurantMenuDto {
    id: string;
    name: string;
    isActive: boolean;
    categories: MenuCategoryDto[];
}

export const restaurantService = {
    async getMyRestaurants(token: string): Promise<RestaurantMenuDto[]> {
        const res = await fetch(`${BASE_URL}/Restaurant/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Restoran bilgileri yüklenemedi.');
        return res.json();
    },

    async toggleCategoryStatus(token: string, restaurantId: string, categoryId: string, activate: boolean): Promise<void> {
        const endpoint = activate ? 'activate' : 'deactivate';
        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/categories/${categoryId}/${endpoint}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Kategori durumu güncellenirken hata oluştu.');
    },

    async toggleProductStatus(token: string, productId: string, activate: boolean): Promise<void> {
        const endpoint = activate ? 'activate' : 'deactivate';
        const res = await fetch(`${BASE_URL}/Products/${productId}/${endpoint}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ürün durumu güncellenirken hata oluştu.');
    },

    async createCategory(token: string, restaurantId: string, name: string, description: string): Promise<void> {
        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        if (!res.ok) throw new Error('Kategori oluşturulurken hata oluştu.');
    },

    async createProduct(token: string, categoryId: string, name: string, description: string, price: number): Promise<void> {
        const res = await fetch(`${BASE_URL}/Products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categoryId, name, description, price })
        });
        if (!res.ok) throw new Error('Ürün oluşturulurken hata oluştu.');
    }
};
