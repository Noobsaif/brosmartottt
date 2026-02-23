
export type Role = 'user' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  _id: string;
  ottName: string;
  packageName: string;
  duration: string;
  price: number;
  offerPrice: number;
  description: string;
  features: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Review {
  _id: string;
  productId: string;
  userUid: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FlashSale {
  _id: string;
  productId: Product; // Populated
  salePrice: number;
  endTime: string;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Order {
  _id: string;
  userUid: string;
  productId: Product; // Populated
  email: string;
  phone: string;
  paymentMethod: 'bkash' | 'nagad' | 'rocket';
  transactionId: string;
  customerNote?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  deliveryDetails?: DeliveryDetails;
  couponCode?: string;
  discountAmount?: number;
  finalPrice?: number;
  createdAt: string;
}

export interface DeliveryDetails {
  ottEmailOrUsername: string;
  ottPassword?: string;
  profileName?: string;
  expiryDate?: string;
  deliveryMessage?: string;
  adminNote?: string;
  deliveredAt: string;
}

export interface Notification {
  _id: string;
  userUid: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  orderId: Order; // Populated
  userUid: string;
  invoiceNumber: string;
  amount: number;
  generatedAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockAlerts: number;
}

export interface Wishlist {
  _id: string;
  userUid: string;
  productId: Product; // Populated
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  firebaseUser: any | null; // Firebase User object
  loading: boolean;
  error: string | null;
}

// Allow environment variable override, otherwise default to localhost
const getApiUrl = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_URL;
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    // @ts-ignore
    return process.env.REACT_APP_API_URL;
  }
  return '/api';
};

export const API_URL = getApiUrl();