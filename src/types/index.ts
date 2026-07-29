export type MarketplaceId =
  | "mercado-livre"
  | "shopee"
  | "amazon"
  | "magalu"
  | "tiktok-shop"
  | "shopify"
  | "woocommerce"
  | "nuvemshop";

export interface Marketplace {
  id: MarketplaceId;
  name: string;
  /** Two-letter mark rendered inside the channel chip. */
  abbr: string;
  color: string;
  connected: boolean;
  accounts: number;
  health: number;
  syncedAt: string;
}

export type OrderStatus =
  | "pendente"
  | "pronto"
  | "transito"
  | "entregue"
  | "cancelado";

export type PaymentMethod = "pix" | "cartao" | "boleto" | "saldo";

export interface OrderItem {
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  cost: number | null;
}

export interface Order {
  id: string;
  code: string;
  marketplace: MarketplaceId;
  account: string;
  status: OrderStatus;
  payment: PaymentMethod;
  buyer: string;
  city: string;
  state: string;
  createdAt: string;
  releaseAt: string;
  revenue: number;
  fees: number;
  shipping: number;
  cost: number | null;
  profit: number;
  margin: number;
  items: OrderItem[];
  tags: string[];
}

export type ProductStatus = "ativo" | "pausado" | "revisao" | "encerrado";

export interface Product {
  id: string;
  sku: string;
  title: string;
  category: string;
  brand: string;
  marketplace: MarketplaceId;
  status: ProductStatus;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  reserved: number;
  reorderPoint: number;
  sold30d: number;
  revenue30d: number;
  visits30d: number;
  conversion: number;
  rating: number;
  reviews: number;
  buyBox: boolean;
  trend: number[];
}

export type MovementType = "entrada" | "saida" | "ajuste" | "devolucao";

export interface StockMovement {
  id: string;
  sku: string;
  product: string;
  type: MovementType;
  quantity: number;
  balance: number;
  warehouse: string;
  operator: string;
  createdAt: string;
}

export type TransactionType = "receita" | "taxa" | "frete" | "custo" | "ads";

export interface Transaction {
  id: string;
  description: string;
  reference: string;
  marketplace: MarketplaceId;
  type: TransactionType;
  amount: number;
  status: "liquidado" | "previsto" | "retido";
  date: string;
}

export type CustomerTier = "novo" | "recorrente" | "vip" | "em-risco";

export interface Customer {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  tier: CustomerTier;
  orders: number;
  spent: number;
  ticket: number;
  lastOrderAt: string;
  nps: number;
}

export type CampaignStatus = "ativa" | "pausada" | "encerrada" | "rascunho";

export interface Campaign {
  id: string;
  name: string;
  marketplace: MarketplaceId;
  objective: string;
  status: CampaignStatus;
  budget: number;
  spend: number;
  revenue: number;
  acos: number;
  roas: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  conversions: number;
  startedAt: string;
}

export interface Competitor {
  id: string;
  seller: string;
  marketplace: MarketplaceId;
  product: string;
  price: number;
  priceDelta: number;
  stock: number;
  sold30d: number;
  rating: number;
  reputation: "platinum" | "gold" | "silver" | "bronze";
  buyBoxShare: number;
  trend: number[];
}

export type AutomationTrigger =
  | "preco"
  | "estoque"
  | "pedido"
  | "concorrente"
  | "agenda";

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  enabled: boolean;
  runs: number;
  successRate: number;
  savedHours: number;
  lastRunAt: string;
}

export type InsightSeverity = "critico" | "atencao" | "oportunidade" | "info";

export interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: InsightSeverity;
  impact: number;
  confidence: number;
  area: string;
  action: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  category: "pedido" | "estoque" | "financeiro" | "ads" | "sistema" | "ia";
  read: boolean;
  createdAt: string;
}

export interface KpiPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  visits: number;
  adSpend: number;
}

export interface RegionSales {
  state: string;
  name: string;
  region: string;
  orders: number;
  revenue: number;
}

export interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: "currency" | "number" | "percent";
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  channel: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  name: string;
  description: string;
  scope: string;
  format: "PDF" | "XLSX" | "CSV";
  schedule: string;
  updatedAt: string;
  size: string;
}

export interface TicketItem {
  id: string;
  subject: string;
  status: "aberto" | "andamento" | "resolvido";
  priority: "baixa" | "media" | "alta";
  channel: string;
  updatedAt: string;
  messages: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Attached data cards the assistant surfaces alongside a reply. */
  metrics?: { label: string; value: string; delta?: number }[];
}
