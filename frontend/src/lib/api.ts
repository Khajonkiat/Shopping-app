import type { Household, HouseholdInvite, PriceEntry, Product, ProductImage, Purchase, Store } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const SERVER_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, "");

export function imageUrl(filename: string): string {
  return `${SERVER_ORIGIN}/uploads/${filename}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; username: string; role: "master" | "user"; household_id: number };
}

export const api = {
  auth: {
    register: (email: string, username: string, password: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  products: {
    list: () => request<Product[]>("/products"),
    get: (id: number) => request<Product>(`/products/${id}`),
    create: (data: Partial<Product>) =>
      request<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Product>) =>
      request<Product>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/products/${id}`, { method: "DELETE" }),
    prices: (id: number) => request<PriceEntry[]>(`/products/${id}/prices`),
    purchases: (id: number) =>
      request<Purchase[]>(`/products/${id}/purchases`),
  },

  stores: {
    list: () => request<Store[]>("/stores"),
    get: (id: number) => request<Store>(`/stores/${id}`),
    create: (data: Partial<Store>) =>
      request<Store>("/stores", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Store>) =>
      request<Store>(`/stores/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/stores/${id}`, { method: "DELETE" }),
  },

  prices: {
    create: (data: Partial<PriceEntry>) =>
      request<PriceEntry>("/prices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<PriceEntry>) =>
      request<PriceEntry>(`/prices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/prices/${id}`, { method: "DELETE" }),
  },

  purchases: {
    list: () => request<Purchase[]>("/purchases"),
    create: (data: Partial<Purchase>) =>
      request<Purchase>("/purchases", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Purchase>) =>
      request<Purchase>(`/purchases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/purchases/${id}`, { method: "DELETE" }),
  },

  household: {
    get: () => request<Household>("/household"),
    generateInvite: () => request<HouseholdInvite>("/household/invite", { method: "POST" }),
    join: (code: string) =>
      request<Household>("/household/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },

  images: {
    list: (productId: number) =>
      request<ProductImage[]>(`/products/${productId}/images`),
    upload: async (productId: number, file: File): Promise<ProductImage> => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`${BASE_URL}/products/${productId}/images`, {
        method: "POST",
        headers,
        body,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }
      return res.json();
    },
    delete: (id: number) =>
      request<void>(`/images/${id}`, { method: "DELETE" }),
  },
};
