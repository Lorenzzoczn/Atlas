export interface SessionUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  plan: "Starter" | "Growth" | "Scale";
  avatarHue: number;
  memberSince: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  members: number;
  channels: number;
}

export const sessionUser: SessionUser = {
  id: "usr_001",
  name: "Lorenzzo Cazani",
  firstName: "Lorenzzo",
  email: "lorenzzo@atlascommerce.com.br",
  role: "Proprietário",
  plan: "Scale",
  avatarHue: 248,
  memberSince: "2025-03-11T00:00:00.000Z",
};

export const workspaces: Workspace[] = [
  { id: "wsp_01", name: "Atlas Retail Group", plan: "Scale", members: 9, channels: 5 },
  { id: "wsp_02", name: "Nexus Distribuidora", plan: "Growth", members: 4, channels: 3 },
  { id: "wsp_03", name: "Estúdio Vertex", plan: "Starter", members: 2, channels: 1 },
];

export const teamMembers = [
  { id: "tm_01", name: "Lorenzzo Cazani", email: "lorenzzo@atlascommerce.com.br", role: "Proprietário", status: "ativo" as const, lastSeen: "agora" },
  { id: "tm_02", name: "Marina Vasquez", email: "marina@atlascommerce.com.br", role: "Administradora", status: "ativo" as const, lastSeen: "há 12 min" },
  { id: "tm_03", name: "Otávio Prado", email: "otavio@atlascommerce.com.br", role: "Compras", status: "ativo" as const, lastSeen: "há 2 h" },
  { id: "tm_04", name: "Renan Delgado", email: "renan@atlascommerce.com.br", role: "Mídia paga", status: "ativo" as const, lastSeen: "há 1 d" },
  { id: "tm_05", name: "Camila Prates", email: "camila@atlascommerce.com.br", role: "Financeiro", status: "convidado" as const, lastSeen: "convite pendente" },
];

export const apiKeys = [
  { id: "key_01", label: "Integração ERP", prefix: "atlas_live_7fA2", createdAt: "2026-02-14T10:00:00.000Z", lastUsed: "há 8 min", scopes: ["pedidos:ler", "estoque:escrever"] },
  { id: "key_02", label: "BI interno", prefix: "atlas_live_c91K", createdAt: "2026-05-02T10:00:00.000Z", lastUsed: "há 3 h", scopes: ["relatorios:ler"] },
  { id: "key_03", label: "Webhook logística", prefix: "atlas_live_Qm44", createdAt: "2026-06-21T10:00:00.000Z", lastUsed: "há 1 d", scopes: ["pedidos:escrever"] },
];

export const billingHistory = [
  { id: "inv_2607", period: "Julho 2026", amount: 1_490, status: "pago" as const, date: "2026-07-01T00:00:00.000Z" },
  { id: "inv_2606", period: "Junho 2026", amount: 1_490, status: "pago" as const, date: "2026-06-01T00:00:00.000Z" },
  { id: "inv_2605", period: "Maio 2026", amount: 1_490, status: "pago" as const, date: "2026-05-01T00:00:00.000Z" },
  { id: "inv_2604", period: "Abril 2026", amount: 890, status: "pago" as const, date: "2026-04-01T00:00:00.000Z" },
];

export const planUsage = [
  { label: "Pedidos sincronizados", used: 1_024, limit: 5_000 },
  { label: "SKUs monitorados", used: 90, limit: 500 },
  { label: "Execuções de automação", used: 8_240, limit: 25_000 },
  { label: "Consultas ao Atlas AI", used: 412, limit: 2_000 },
];
