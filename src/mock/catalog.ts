import type { Marketplace, MarketplaceId } from "@/types";
import { MOCK_NOW } from "@/config/site";
import { daysAgo } from "./random";

export const marketplaces: Marketplace[] = [
  {
    id: "mercado-livre",
    name: "Mercado Livre",
    abbr: "ML",
    color: "#f2c94c",
    connected: true,
    accounts: 3,
    health: 96,
    syncedAt: daysAgo(MOCK_NOW, 0, 0.2),
  },
  {
    id: "shopee",
    name: "Shopee",
    abbr: "SH",
    color: "#f97362",
    connected: true,
    accounts: 2,
    health: 92,
    syncedAt: daysAgo(MOCK_NOW, 0, 0.5),
  },
  {
    id: "amazon",
    name: "Amazon",
    abbr: "AZ",
    color: "#7dd3fc",
    connected: true,
    accounts: 1,
    health: 88,
    syncedAt: daysAgo(MOCK_NOW, 0, 1.4),
  },
  {
    id: "magalu",
    name: "Magalu",
    abbr: "MG",
    color: "#60a5fa",
    connected: true,
    accounts: 1,
    health: 81,
    syncedAt: daysAgo(MOCK_NOW, 0, 3),
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop",
    abbr: "TT",
    color: "#f472b6",
    connected: true,
    accounts: 1,
    health: 74,
    syncedAt: daysAgo(MOCK_NOW, 0, 6),
  },
  {
    id: "shopify",
    name: "Shopify",
    abbr: "SP",
    color: "#4ade80",
    connected: false,
    accounts: 0,
    health: 0,
    syncedAt: daysAgo(MOCK_NOW, 21),
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    abbr: "WC",
    color: "#c084fc",
    connected: false,
    accounts: 0,
    health: 0,
    syncedAt: daysAgo(MOCK_NOW, 40),
  },
  {
    id: "nuvemshop",
    name: "NuvemShop",
    abbr: "NS",
    color: "#38bdf8",
    connected: false,
    accounts: 0,
    health: 0,
    syncedAt: daysAgo(MOCK_NOW, 63),
  },
];

export const marketplaceMap = Object.fromEntries(
  marketplaces.map((m) => [m.id, m]),
) as Record<MarketplaceId, Marketplace>;

export const connectedMarketplaces = marketplaces
  .filter((m) => m.connected)
  .map((m) => m.id);

export const productCatalog = [
  { title: "Fone Bluetooth ANC Aurex Studio 40h", category: "Áudio", brand: "Aurex", price: 289.9, cost: 96.4 },
  { title: "Smartwatch Nyx Fit Pro AMOLED 1.85\"", category: "Wearables", brand: "Nyx", price: 349.0, cost: 128.0 },
  { title: "Teclado Mecânico Kortex K68 Hot Swap", category: "Periféricos", brand: "Kortex", price: 419.9, cost: 171.5 },
  { title: "Mouse Gamer Kortex Vantage 26K DPI", category: "Periféricos", brand: "Kortex", price: 189.9, cost: 62.3 },
  { title: "Cadeira Ergonômica Vertex Mesh Lumbar", category: "Escritório", brand: "Vertex", price: 1290.0, cost: 612.0 },
  { title: "Monitor Vertex 27\" 180Hz QHD IPS", category: "Monitores", brand: "Vertex", price: 1749.0, cost: 1024.0 },
  { title: "Air Fryer Culina 8L Digital Inox", category: "Casa", brand: "Culina", price: 549.9, cost: 248.0 },
  { title: "Cafeteira Culina Espresso 20 Bar", category: "Casa", brand: "Culina", price: 899.0, cost: 431.0 },
  { title: "Aspirador Robô Culina Nav Lidar", category: "Casa", brand: "Culina", price: 1899.0, cost: 967.0 },
  { title: "Kit Halteres Ajustáveis Forma 24kg", category: "Fitness", brand: "Forma", price: 749.0, cost: 341.0 },
  { title: "Tênis Corrida Forma Aero Boost", category: "Calçados", brand: "Forma", price: 429.9, cost: 168.0 },
  { title: "Mochila Antifurto Nomad Urban 30L", category: "Acessórios", brand: "Nomad", price: 259.9, cost: 88.0 },
  { title: "Power Bank Volt 20000mAh 65W GaN", category: "Energia", brand: "Volt", price: 279.9, cost: 104.0 },
  { title: "Carregador Volt GaN 100W 4 Portas", category: "Energia", brand: "Volt", price: 199.9, cost: 71.0 },
  { title: "Câmera de Segurança Vigil 2K Wi-Fi", category: "Segurança", brand: "Vigil", price: 239.9, cost: 89.5 },
  { title: "Smart Lâmpada Lumen RGB 12W (4un)", category: "Smart Home", brand: "Lumen", price: 169.9, cost: 54.0 },
  { title: "Soundbar Aurex Cinema 2.1 240W", category: "Áudio", brand: "Aurex", price: 899.0, cost: 402.0 },
  { title: "Tablet Nyx Tab 11 128GB Wi-Fi", category: "Tablets", brand: "Nyx", price: 1399.0, cost: 812.0 },
  { title: "SSD NVMe Kortex Rapid 1TB Gen4", category: "Armazenamento", brand: "Kortex", price: 519.0, cost: 288.0 },
  { title: "Webcam Vertex Stream 4K Autofoco", category: "Periféricos", brand: "Vertex", price: 469.9, cost: 201.0 },
  { title: "Umidificador Culina Mist 5L Ultra", category: "Casa", brand: "Culina", price: 219.9, cost: 78.0 },
  { title: "Escova Secadora Bela Ion Pro 1300W", category: "Beleza", brand: "Bela", price: 189.9, cost: 66.0 },
  { title: "Barbeador Elétrico Bela Precision X3", category: "Beleza", brand: "Bela", price: 279.9, cost: 101.0 },
  { title: "Panela Elétrica Culina Multi 12 em 1", category: "Casa", brand: "Culina", price: 649.0, cost: 297.0 },
  { title: "Suporte Ergonômico Vertex Monitor Duplo", category: "Escritório", brand: "Vertex", price: 389.0, cost: 142.0 },
  { title: "Headset Gamer Aurex Arena 7.1", category: "Áudio", brand: "Aurex", price: 329.9, cost: 118.0 },
  { title: "Bicicleta Ergométrica Forma Spin S3", category: "Fitness", brand: "Forma", price: 1590.0, cost: 803.0 },
  { title: "Mala de Bordo Nomad Rígida 20\"", category: "Acessórios", brand: "Nomad", price: 449.9, cost: 179.0 },
  { title: "Projetor Vertex Beam Full HD 700 ANSI", category: "Vídeo", brand: "Vertex", price: 2190.0, cost: 1248.0 },
  { title: "Fechadura Digital Vigil Lock Biométrica", category: "Segurança", brand: "Vigil", price: 799.0, cost: 358.0 },
] as const;

export const categories = [...new Set(productCatalog.map((p) => p.category))];
export const brands = [...new Set(productCatalog.map((p) => p.brand))];

export const buyerNames = [
  "Ana Beatriz Furtado", "Rafael Nogueira Lima", "Camila Prates Antunes",
  "Diego Sarmento Rocha", "Helena Vasconcelos", "Bruno Tavares Meireles",
  "Larissa Quintela Amado", "Vinícius Bastos Corrêa", "Patrícia Andrade Roque",
  "Thiago Peçanha Freire", "Isabela Moreno Cardim", "Gustavo Rabelo Pinto",
  "Fernanda Salgueiro", "Marcelo Aguiar Bezerra", "Juliana Castilho Neves",
  "Eduardo Portela Ramos", "Natália Bittencourt", "Leandro Guimarães Sá",
  "Renata Vilhena Duarte", "Otávio Menezes Coutinho", "Bianca Serrano Lopes",
  "Henrique Vidal Barroso", "Priscila Fontenele", "André Luiz Sampaio",
  "Carolina Vasques Milani", "Rodrigo Cerqueira Alves", "Mariana Toledo Ferraz",
  "Felipe Camargo Dantas", "Letícia Barbosa Kuhn", "Caio Estevão Marques",
] as const;

export const cities = [
  { city: "São Paulo", state: "SP", region: "Sudeste" },
  { city: "Campinas", state: "SP", region: "Sudeste" },
  { city: "Rio de Janeiro", state: "RJ", region: "Sudeste" },
  { city: "Belo Horizonte", state: "MG", region: "Sudeste" },
  { city: "Vitória", state: "ES", region: "Sudeste" },
  { city: "Curitiba", state: "PR", region: "Sul" },
  { city: "Porto Alegre", state: "RS", region: "Sul" },
  { city: "Florianópolis", state: "SC", region: "Sul" },
  { city: "Salvador", state: "BA", region: "Nordeste" },
  { city: "Recife", state: "PE", region: "Nordeste" },
  { city: "Fortaleza", state: "CE", region: "Nordeste" },
  { city: "Natal", state: "RN", region: "Nordeste" },
  { city: "Goiânia", state: "GO", region: "Centro-Oeste" },
  { city: "Brasília", state: "DF", region: "Centro-Oeste" },
  { city: "Cuiabá", state: "MT", region: "Centro-Oeste" },
  { city: "Manaus", state: "AM", region: "Norte" },
  { city: "Belém", state: "PA", region: "Norte" },
] as const;

export const warehouses = [
  "CD São Paulo",
  "CD Extrema",
  "Full Mercado Livre",
  "Shopee Xpress",
  "Loja Matriz",
] as const;

export const operators = [
  "Marina Vasquez",
  "Otávio Prado",
  "Renan Delgado",
  "Sistema Atlas",
] as const;
