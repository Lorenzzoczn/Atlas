export const siteConfig = {
  name: "Atlas Commerce AI",
  shortName: "Atlas",
  tagline: "Inteligência que impulsiona cada venda.",
  description:
    "Plataforma de inteligência comercial para vendedores de marketplaces: pedidos, margem, estoque, concorrência e automações em um só lugar.",
  url: "https://atlas-commerce.ai",
  locale: "pt-BR",
} as const;

/**
 * Fixed clock for the whole mock layer. Every generated date derives from this
 * so the server render and the client hydration always agree.
 */
export const MOCK_NOW = new Date("2026-07-28T18:30:00.000Z");
