
import { OrderStatus, UserRole, Product, Order, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'CHILI-500', name: '🌶️ মিষ্টি মরিচ (Sweet Chili Powder) - 500g', price: 550 },
  { id: 'p2', sku: 'CHILI-1KG', name: '🌶️ মিষ্টি মরিচ (Sweet Chili Powder) - 1kg', price: 950 },
  { id: 'p3', sku: 'G-MASALA-200', name: '👑 শাহী গরম মসলা (Shahi Garam Masala) - 200g', price: 650 },
  { id: 'p4', sku: 'G-MASALA-500', name: '👑 শাহী গরম মসলা (Shahi Garam Masala) - 500g', price: 1424 },
  { id: 'p5', sku: 'TURM-500', name: '💛 দেশি হলুদের গুঁড়া (Turmeric Powder) - 500g', price: 290 },
  { id: 'p6', sku: 'CORI-500', name: '🌿 দেশি ধনিয়া গুঁড়া (Coriander Powder) - 500g', price: 250 },
  { id: 'p7', sku: 'CUMIN-500', name: '🌾 দেশি জিরা গুঁড়া (Cumin Powder) - 500g', price: 780 },
  { id: 'p8', sku: 'MEZBAN-200', name: '🍖 মেজবানি মাংসের মসলা (Mezban Masala) - 200g', price: 680 },
  { id: 'p9', sku: 'MEZBAN-500', name: '🍖 মেজবানি মাংসের মসলা (Mezban Masala) - 500g', price: 1480 },
];

export const INITIAL_MODERATORS: User[] = [
  { id: 'm1', name: 'Rahim Ahmed', email: 'rahim@test.com', role: UserRole.MODERATOR },
  { id: 'm2', name: 'Sumit Das', email: 'sumit@test.com', role: UserRole.MODERATOR },
];

export const ADMIN_USER: User = {
  id: 'a1',
  name: 'System Admin',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1021',
    moderatorId: 'm1',
    customerName: 'Karim Ullah',
    customerPhone: '01712345678',
    customerAddress: 'Mirpur, Dhaka',
    status: OrderStatus.PENDING,
    totalAmount: 1200,
    createdAt: new Date().toISOString(),
    items: [
      { id: 'oi1', productId: 'p1', quantity: 1, price: 550 },
      { id: 'oi2', productId: 'p3', quantity: 1, price: 650 },
    ]
  },
  {
    id: 'ORD-1022',
    moderatorId: 'm2',
    customerName: 'Jannat Begum',
    customerPhone: '01987654321',
    customerAddress: 'Uttara, Dhaka',
    status: OrderStatus.CONFIRMED,
    totalAmount: 1424,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: 'oi3', productId: 'p4', quantity: 1, price: 1424 },
    ]
  }
];

export const STATUS_COLORS = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};
