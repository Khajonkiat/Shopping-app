export interface ProductImage {
  id: number;
  product_id: number;
  filename: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  description: string;
  price_entries?: PriceEntry[];
  purchases?: Purchase[];
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  base_url: string;
  created_at: string;
  updated_at: string;
}

export type SourceType = "manual" | "scraped";

export interface PriceEntry {
  id: number;
  product_id: number;
  store_id: number;
  price: number;
  currency: string;
  recorded_at: string;
  source_type: SourceType;
  source_url: string;
  store?: Store;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  product_id: number;
  store_id: number;
  price: number;
  quantity: number;
  purchased_at: string;
  notes: string;
  product?: Product;
  store?: Store;
  created_at: string;
  updated_at: string;
}
