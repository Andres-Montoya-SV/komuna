export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  rating?: number;
  totalProducts: number;
  totalSales: number;
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
  categories: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
  phone?: string;
}

export interface StoreFormData {
  name: string;
  description: string;
  categories: string[];
  logo?: string;
  banner?: string;
}


