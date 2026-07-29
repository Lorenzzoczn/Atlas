# Atlas Commerce AI

**Inteligência que impulsiona cada venda.**

Plataforma SaaS de inteligência comercial para vendedores de marketplaces. Esta é
a **fase 1 — interface**: toda a experiência está construída, e a camada de dados
é simulada de ponta a ponta.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Radix UI · Framer Motion · Recharts · TanStack Query · React Hook Form + Zod ·
Lucide · Sonner · cmdk · next-themes.

## Rotas

| Rota | Módulo |
| --- | --- |
| `/` | Dashboard — KPIs, insights de IA, heatmap, cartograma, funil, radar, metas |
| `/atlas-ai` | Copiloto Atlas AI (chat, descobertas, índice de saúde) |
| `/analises` | Funil, coortes, elasticidade de preço, comparativo anual |
| `/pedidos` | Fila de pedidos com linha expansível e composição do resultado |
| `/produtos` | Catálogo em tabela ordenável ou grade |
| `/estoque` | Cobertura projetada, ruptura e movimentações |
| `/clientes` | Base de compradores, segmentos e LTV |
| `/financeiro` | Fluxo de caixa, estrutura de custos, recebíveis e DRE |
| `/publicidade` · `/campanhas` | Investimento, ACOS/ROAS e gestão de campanhas |
| `/concorrentes` | Radar de preço, Buy Box e reputação |
| `/marketplaces` | Canais conectados e saúde da integração |
| `/automacoes` | Regras com gatilho, execuções e taxa de sucesso |
| `/relatorios` | Exportações agendadas |
| `/configuracoes` · `/perfil` · `/notificacoes` · `/suporte` | Conta e plataforma |
| `/login` | Autenticação simulada |

Rotas mock de API: `/api/overview`, `/api/orders`, `/api/products`,
`/api/insights`, `/api/atlas`.

## Organização

```
src/
  app/          rotas do App Router + route handlers mock
  components/
    brand/      marca Atlas (SVG animado, CSS, variantes)
    charts/     primitivas de gráfico compartilhadas
    data/       toolbar, paginação, chips de canal
    layout/     sidebar, topbar, command palette, page header
    ui/         biblioteca de componentes
  config/       navegação, site, períodos
  features/     uma pasta por módulo do produto
  hooks/  layouts/  lib/  providers/  services/  store/
  mock/         geradores determinísticos de dados
  types/  utils/
```

## Decisões que valem saber

**Dados determinísticos.** Todo o mock nasce de um PRNG com semente fixa
(`src/mock/random.ts`) e de um relógio congelado (`MOCK_NOW`). Nada usa
`Math.random()` ou `Date.now()`, então o HTML do servidor é idêntico ao do
cliente. Os datasets são calibrados para uma mesma operação fictícia — cerca de
1.000 pedidos e R$ 1,0 milhão a cada 30 dias, com ticket próximo de R$ 1.000 —
descrita no topo de `src/mock/analytics.ts`. Ao mexer em um gerador, confira os
outros contra essas âncoras.

**Animação de entrada em CSS, não em JS.** Um `initial={{ opacity: 0 }}` do
Framer Motion embute `opacity: 0` no HTML servido: a página fica em branco até a
hidratação. O componente `Reveal` (`src/components/ui/reveal.tsx`) resolve isso
com keyframes CSS — o conteúdo já vem visível e a animação apenas o apresenta.
Framer Motion continua responsável por layout, `AnimatePresence`, drawers e
gestos. As barras de progresso seguem a mesma ideia: largura inline mais um
`clip-path` animado.

**Formatação compacta feita à mão.** `Intl.NumberFormat` com
`notation: "compact"` usa dados ICU diferentes no Node e no navegador
("R$ 162 mil" contra "R$ 162,0 mil"), o que quebra a hidratação. `currencyCompact`
e `numberCompact` implementam a regra manualmente, e os formatadores de data
fixam o fuso `America/Sao_Paulo`.

**Preferências fora do React.** Tema, sidebar, período e sessão vivem em stores
de módulo lidas por `useSyncExternalStore`, com snapshot de servidor igual aos
valores padrão. Isso mantém a hidratação correta sem escrever estado dentro de
efeitos.

## Fase atual

Não há banco, API externa ou modelo de IA conectado. A autenticação é um flag em
`localStorage` e aceita qualquer senha com 6 ou mais caracteres. As respostas do
Atlas AI são pré-escritas e selecionadas por intenção. Os route handlers em
`src/app/api` já expõem o formato de resposta que a implementação real deve
manter.
