"use client";

import { api, query } from "@/lib/api-client";
import type { MarketplaceId } from "@/types";

/**
 * Cliente tipado da API do Atlas.
 *
 * Convive com `atlas-api.ts`, que ainda serve as telas em dados simulados.
 * À medida que cada tela migra, a função correspondente sai de lá e entra aqui.
 */

// ────────────────────────────────────────────────────────────────── contratos

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  roleKey: string;
  isOwner: boolean;
}

export interface AuthSession {
  user: AuthUser;
  organization: AuthOrganization | null;
  permissions: string[];
  tokens: AuthTokens;
}

export type MarketplaceProvider =
  | "MERCADO_LIVRE"
  | "SHOPEE"
  | "AMAZON"
  | "MAGALU"
  | "TIKTOK_SHOP"
  | "SHOPIFY"
  | "WOOCOMMERCE"
  | "NUVEMSHOP";

/**
 * O backend usa `MERCADO_LIVRE`; o catálogo visual usa `mercado-livre`.
 * A conversão é mecânica, mas centralizá-la evita repetir o cast em cada tela.
 */
export function channelIdOf(provider: MarketplaceProvider): MarketplaceId {
  return provider.toLowerCase().replace(/_/g, "-") as MarketplaceId;
}

export interface MarketplaceAccount {
  id: string;
  provider: MarketplaceProvider;
  status: "PENDING" | "CONNECTED" | "EXPIRED" | "REVOKED" | "ERROR";
  nickname: string | null;
  sellerId: string | null;
  siteId: string | null;
  countryCode: string | null;
  scopes: string[];
  health: number;
  lastSyncedAt: string | null;
  lastErrorMessage: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
}

export interface ChannelCatalogEntry {
  provider: MarketplaceProvider;
  label: string;
  available: boolean;
}

export interface SyncRun {
  id: string;
  resource: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  processed: number;
  created: number;
  updated: number;
  failed: number;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
}

export interface OrderRow {
  id: string;
  externalId: string;
  externalCode: string | null;
  status: string;
  channelStatus: string | null;
  buyerName: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  currency: string;
  grossAmount: string;
  feeAmount: string;
  shippingCost: string;
  costAmount: string | null;
  netProfit: string | null;
  paymentMethod: string | null;
  placedAt: string;
  account: { id: string; provider: MarketplaceProvider; nickname: string | null };
  items: Array<{
    id: string;
    sku: string | null;
    title: string;
    quantity: number;
    unitPrice: string;
    unitCost: string | null;
  }>;
  shipments: Array<{
    id: string;
    status: string | null;
    trackingCode: string | null;
    carrier: string | null;
    logisticType: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  }>;
}

export interface OrdersSummary {
  orders: number;
  revenue: number;
  fees: number;
  shipping: number;
  cost: number;
  profit: number;
  margin: number;
  averageTicket: number;
  byStatus: Array<{ status: string; count: number; revenue: number }>;
  missingCost: { orders: number; revenue: number };
}

export interface ListingRow {
  id: string;
  externalId: string;
  title: string;
  status: string;
  permalink: string | null;
  price: string | null;
  availableQty: number;
  soldQty: number;
  freeShipping: boolean;
  logisticType: string | null;
  healthPercent: number | null;
  isFulfillment: boolean;
  isFlex: boolean;
  lastSyncedAt: string | null;
  account: { id: string; provider: MarketplaceProvider; nickname: string | null };
  product: { id: string; sku: string; costPrice: string | null } | null;
}

export interface InventorySummary {
  activeListings: number;
  unitsAvailable: number;
  unitsSold: number;
  lowStockListings: number;
  byLogistic: Array<{ logisticType: string; listings: number; units: number }>;
}

export interface ShipmentRow {
  id: string;
  status: string | null;
  trackingCode: string | null;
  carrier: string | null;
  logisticType: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedAt: string | null;
  order: {
    id: string;
    code: string | null;
    status: string;
    buyerName: string | null;
    city: string | null;
    state: string | null;
    placedAt: string;
    provider: MarketplaceProvider;
    account: string | null;
  };
}

export interface ShipmentsSummary {
  total: number;
  delivered: number;
  inTransit: number;
  byStatus: Array<{ value: string; count: number }>;
  byLogisticType: Array<{ value: string; count: number }>;
}

// ──────────────────────────────────────────────────────────────────── chamadas

export const authApi = {
  login: (email: string, password: string) =>
    api<AuthSession>("/auth/login", {
      method: "POST",
      body: { email, password },
      anonymous: true,
    }),

  register: (input: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
  }) => api<AuthSession>("/auth/register", { method: "POST", body: input, anonymous: true }),

  me: () =>
    api<{
      userId: string;
      email: string;
      name: string;
      organizationId: string;
      roleKey: string;
      isOwner: boolean;
      permissions: string[];
    }>("/auth/me"),

  logout: () => api<void>("/auth/logout", { method: "POST" }),
};

export const integrationsApi = {
  catalog: () => api<ChannelCatalogEntry[]>("/integrations/catalog"),

  accounts: () => api<MarketplaceAccount[]>("/integrations/accounts"),

  /** Devolve a URL oficial do canal — o front redireciona o navegador para lá. */
  connect: (provider: MarketplaceProvider, redirectTo?: string) =>
    api<{ authorizationUrl: string; state: string; expiresAt: string }>(
      "/integrations/connect",
      { method: "POST", body: { provider, redirectTo } },
    ),

  disconnect: (accountId: string) =>
    api<{ disconnected: boolean }>(`/integrations/accounts/${accountId}`, {
      method: "DELETE",
    }),

  sync: (accountId: string, resources?: string[]) =>
    api<{ queued: string[] }>(`/integrations/accounts/${accountId}/sync`, {
      method: "POST",
      body: { resources },
    }),

  syncRuns: (accountId: string) =>
    api<SyncRun[]>(`/integrations/accounts/${accountId}/sync-runs`),
};

/**
 * `type` e não `interface`: só aliases ganham index signature implícita, e sem
 * ela o TypeScript recusa passar o objeto para `query()`.
 */
export type OrderFilters = {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  from?: string;
  to?: string;
};

export const commerceApi = {
  orders: (filters: OrderFilters = {}) =>
    api<Paged<OrderRow>>(`/orders${query(filters)}`),

  ordersSummary: (filters: OrderFilters = {}) =>
    api<OrdersSummary>(`/orders/summary${query(filters)}`),

  order: (id: string) => api<OrderRow>(`/orders/${id}`),

  listings: (
    filters: {
      search?: string;
      status?: string;
      provider?: string;
      logisticType?: string;
      lowStock?: boolean;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ) => api<Paged<ListingRow>>(`/inventory/listings${query(filters)}`),

  inventorySummary: () => api<InventorySummary>("/inventory/summary"),

  shipments: (
    filters: {
      status?: string;
      logisticType?: string;
      pending?: boolean;
      page?: number;
      pageSize?: number;
      sortOrder?: "asc" | "desc";
    } = {},
  ) => api<Paged<ShipmentRow>>(`/shipments${query(filters)}`),

  shipmentsSummary: () => api<ShipmentsSummary>("/shipments/summary"),
};

/** Chaves do React Query, centralizadas para invalidação consistente. */
export const queryKeys = {
  accounts: ["integrations", "accounts"] as const,
  catalog: ["integrations", "catalog"] as const,
  syncRuns: (id: string) => ["integrations", "sync-runs", id] as const,
  orders: (filters: OrderFilters) => ["orders", filters] as const,
  ordersSummary: (filters: OrderFilters) => ["orders", "summary", filters] as const,
  listings: (filters: object) => ["listings", filters] as const,
  inventorySummary: ["inventory", "summary"] as const,
  shipments: (filters: object) => ["shipments", filters] as const,
  shipmentsSummary: ["shipments", "summary"] as const,
};
