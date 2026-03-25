export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  price: number;
  costPrice: number;
  stock: number;
  expiryDate: string;
  batchNumber: string;
  unit: string; // e.g., Tablet, Syrup, Capsule
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountPercent?: number;
  total: number;
  customerPhone?: string;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Banking';
}

export interface Settings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  logoUrl?: string;
  currency: string;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pharmacist' | 'staff';
  password: string;
  createdAt: string;
  lastLogin?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pharmacist' | 'staff';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'pharmacist' | 'staff';
}

export interface PharmacyData {
  medicines: Medicine[];
  sales: Sale[];
  settings: Settings;
  users?: User[];
}
