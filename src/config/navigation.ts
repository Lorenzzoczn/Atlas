import {
  Activity,
  Bell,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  CircleQuestionMark,
  FileText,
  LayoutDashboard,
  Megaphone,
  Package,
  Radar,
  Settings,
  ShoppingCart,
  Store,
  Target,
  User,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Numeric badge, or a short word like "novo". */
  badge?: string | number;
  description: string;
  keywords?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Panorama de receita, lucro e operação",
        keywords: ["home", "início", "kpi", "resumo"],
      },
      {
        href: "/atlas-ai",
        label: "Atlas AI",
        icon: Bot,
        badge: "IA",
        description: "Copiloto de inteligência comercial",
        keywords: ["chat", "copiloto", "insight", "ia"],
      },
      {
        href: "/analises",
        label: "Análises",
        icon: ChartNoAxesCombined,
        description: "Funil, coortes, elasticidade e comparativos",
        keywords: ["analytics", "gráfico", "funil", "coorte"],
      },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        href: "/pedidos",
        label: "Pedidos",
        icon: ShoppingCart,
        badge: 18,
        description: "Fila de pedidos, status e rentabilidade",
        keywords: ["vendas", "order", "envio"],
      },
      {
        href: "/produtos",
        label: "Produtos",
        icon: Package,
        description: "Catálogo, preço, margem e desempenho",
        keywords: ["catálogo", "sku", "anúncio"],
      },
      {
        href: "/estoque",
        label: "Estoque",
        icon: Boxes,
        badge: 9,
        description: "Cobertura, ruptura e movimentações",
        keywords: ["inventário", "cd", "ruptura"],
      },
      {
        href: "/clientes",
        label: "Clientes",
        icon: Users,
        description: "Base de compradores, LTV e recompra",
        keywords: ["comprador", "crm", "ltv"],
      },
    ],
  },
  {
    label: "Crescimento",
    items: [
      {
        href: "/financeiro",
        label: "Financeiro",
        icon: Wallet,
        description: "Repasses, custos, fluxo de caixa e DRE",
        keywords: ["dre", "caixa", "repasse", "conciliação"],
      },
      {
        href: "/publicidade",
        label: "Publicidade",
        icon: Megaphone,
        description: "Investimento, ACOS e retorno de mídia",
        keywords: ["ads", "acos", "roas", "mídia"],
      },
      {
        href: "/campanhas",
        label: "Campanhas",
        icon: Target,
        description: "Gestão e performance de cada campanha",
        keywords: ["campaign", "orçamento"],
      },
      {
        href: "/concorrentes",
        label: "Concorrentes",
        icon: Radar,
        description: "Radar de preço, Buy Box e reputação",
        keywords: ["competidor", "buy box", "preço"],
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      {
        href: "/marketplaces",
        label: "Marketplaces",
        icon: Store,
        description: "Canais conectados e saúde da integração",
        keywords: ["canal", "integração", "conectar"],
      },
      {
        href: "/automacoes",
        label: "Automações",
        icon: Workflow,
        badge: "6",
        description: "Gatilhos, regras e execuções automáticas",
        keywords: ["regra", "robô", "repricing"],
      },
      {
        href: "/relatorios",
        label: "Relatórios",
        icon: FileText,
        description: "Exportações agendadas e sob demanda",
        keywords: ["export", "pdf", "planilha"],
      },
    ],
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    href: "/notificacoes",
    label: "Notificações",
    icon: Bell,
    badge: 3,
    description: "Central de alertas da operação",
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    description: "Conta, equipe, faturamento e API",
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: User,
    description: "Seus dados, preferências e segurança",
  },
  {
    href: "/suporte",
    label: "Suporte",
    icon: CircleQuestionMark,
    description: "Central de ajuda e chamados",
  },
];

export const allNavItems: NavItem[] = [
  ...navigation.flatMap((group) => group.items),
  ...secondaryNavigation,
];

export const navItemByHref = new Map(allNavItems.map((item) => [item.href, item]));

/** Quick actions surfaced inside the command palette. */
export const commandActions = [
  { id: "cmd_order", label: "Registrar venda externa", icon: ShoppingCart, hint: "Pedidos" },
  { id: "cmd_product", label: "Cadastrar novo produto", icon: Package, hint: "Produtos" },
  { id: "cmd_report", label: "Exportar relatório do período", icon: FileText, hint: "Relatórios" },
  { id: "cmd_automation", label: "Criar automação de preço", icon: Workflow, hint: "Automações" },
  { id: "cmd_ai", label: "Perguntar ao Atlas AI", icon: Bot, hint: "Atlas AI" },
  { id: "cmd_sync", label: "Sincronizar todos os canais", icon: Activity, hint: "Marketplaces" },
];
