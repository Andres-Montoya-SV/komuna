export type ItemType = 'product' | 'service' | 'pet' | 'job';

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  type: ItemType;
  storeId?: string;
  storeName?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviews?: number;
}

export interface Product extends BaseItem {
  type: 'product';
  stock: number;
}

export interface Service extends BaseItem {
  type: 'service';
  duration?: string; // e.g., "2 hours", "1 day"
  availability?: string; // e.g., "Monday-Friday 9am-5pm"
}

export interface Pet extends BaseItem {
  type: 'pet';
  breed?: string;
  age?: string;
  gender?: 'male' | 'female';
  location: string;
}

export interface Job extends BaseItem {
  type: 'job';
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  location?: string;
  requirements?: string[];
}

export type MarketplaceItem = Product | Service | Pet | Job;

export interface CartItem {
  item: MarketplaceItem;
  quantity: number;
}

export interface FilterOptions {
  category?: string;
  type?: ItemType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating';
}
