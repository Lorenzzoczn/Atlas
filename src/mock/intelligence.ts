import type {
  ActivityEvent,
  ChatMessage,
  Insight,
  NotificationItem,
  ReportItem,
  TicketItem,
} from "@/types";
import { MOCK_NOW } from "@/config/site";
import { daysAgo } from "./random";

export const insights: Insight[] = [
  {
    id: "ins_01",
    title: "9 SKUs vendendo abaixo do custo real",
    detail:
      "Após comissão, frete e imposto, esses anúncios operam com margem negativa média de -4,8%. Reajustar o preço em 6% recupera a rentabilidade sem sair da faixa competitiva.",
    severity: "critico",
    impact: 18_420,
    confidence: 94,
    area: "Precificação",
    action: "Revisar precificação",
  },
  {
    id: "ins_02",
    title: "Ruptura projetada em 11 dias no top 3 de receita",
    detail:
      "O Fone Bluetooth ANC Aurex Studio mantém giro de 7,4 unidades/dia com 82 unidades em estoque. O lead time do fornecedor é de 14 dias.",
    severity: "atencao",
    impact: 42_300,
    confidence: 89,
    area: "Estoque",
    action: "Gerar pedido de compra",
  },
  {
    id: "ins_03",
    title: "Janela de 19h às 22h converte 2,4× melhor",
    detail:
      "Concentrar 38% do orçamento diário de mídia nesse intervalo elevaria o ROAS estimado de 4,1 para 5,6 mantendo o mesmo investimento total.",
    severity: "oportunidade",
    impact: 12_760,
    confidence: 82,
    area: "Publicidade",
    action: "Ajustar dayparting",
  },
  {
    id: "ins_04",
    title: "Concorrente reduziu preço em 6 SKUs monitorados",
    detail:
      "TechPrime Oficial assumiu a Buy Box em 4 dos 6 anúncios nas últimas 48 h. Sua margem permite acompanhar até -3,2% sem entrar em prejuízo.",
    severity: "atencao",
    impact: 9_180,
    confidence: 91,
    area: "Concorrência",
    action: "Ativar repricing",
  },
  {
    id: "ins_05",
    title: "Categoria Casa cresce 34% acima da média",
    detail:
      "Ampliar o mix com 5 SKUs adjacentes de alto giro pode adicionar receita incremental relevante já no próximo ciclo de 30 dias.",
    severity: "oportunidade",
    impact: 27_500,
    confidence: 76,
    area: "Sortimento",
    action: "Explorar no Garimpador",
  },
  {
    id: "ins_06",
    title: "Pedidos sem SKU vinculado distorcem o lucro",
    detail:
      "Parte da receita do período está sem custo associado, o que infla o lucro líquido reportado em aproximadamente 4,1 pontos percentuais. Vincular os custos corrige o indicador retroativamente.",
    severity: "critico",
    impact: 62_400,
    confidence: 100,
    area: "Dados",
    action: "Vincular custos",
  },
  {
    id: "ins_07",
    title: "Frete grátis abaixo de R$ 79 corrói 11% da margem",
    detail:
      "Elevar o piso de frete grátis para R$ 99 impacta 6% dos pedidos e devolve margem sem alterar de forma relevante a conversão.",
    severity: "info",
    impact: 7_940,
    confidence: 71,
    area: "Logística",
    action: "Simular cenário",
  },
];

export const insightScore = {
  value: 78,
  label: "Saúde comercial",
  breakdown: [
    { label: "Rentabilidade", value: 72 },
    { label: "Estoque", value: 64 },
    { label: "Competitividade", value: 83 },
    { label: "Mídia paga", value: 88 },
    { label: "Qualidade de dados", value: 81 },
  ],
};

export const notifications: NotificationItem[] = [
  {
    id: "ntf_01",
    title: "Queda de 73% nas vendas de hoje",
    detail: "Comparado à média das últimas 4 terças-feiras no mesmo horário.",
    category: "sistema",
    read: false,
    createdAt: daysAgo(MOCK_NOW, 0, 0.4),
  },
  {
    id: "ntf_02",
    title: "Atlas AI encontrou 9 SKUs com margem negativa",
    detail: "Impacto estimado de R$ 18.420 no trimestre.",
    category: "ia",
    read: false,
    createdAt: daysAgo(MOCK_NOW, 0, 1.6),
  },
  {
    id: "ntf_03",
    title: "Estoque crítico: Air Fryer Culina 8L",
    detail: "4 unidades restantes · cobertura de 1,2 dia.",
    category: "estoque",
    read: false,
    createdAt: daysAgo(MOCK_NOW, 0, 3.2),
  },
  {
    id: "ntf_04",
    title: "Repasse de R$ 24.318,40 liberado",
    detail: "Mercado Livre · conta Atlas Store Oficial.",
    category: "financeiro",
    read: true,
    createdAt: daysAgo(MOCK_NOW, 0, 7),
  },
  {
    id: "ntf_05",
    title: "Campanha 'Escalar vendas · Q3 4' atingiu 92% do orçamento",
    detail: "ROAS atual de 6,4 — considere ampliar o teto diário.",
    category: "ads",
    read: true,
    createdAt: daysAgo(MOCK_NOW, 1, 2),
  },
  {
    id: "ntf_06",
    title: "18 pedidos aguardando emissão de nota",
    detail: "Prazo do canal expira em 6 horas.",
    category: "pedido",
    read: true,
    createdAt: daysAgo(MOCK_NOW, 1, 9),
  },
  {
    id: "ntf_07",
    title: "Sincronização da Amazon concluída",
    detail: "1.284 anúncios atualizados sem divergências.",
    category: "sistema",
    read: true,
    createdAt: daysAgo(MOCK_NOW, 2, 1),
  },
];

export const activityFeed: ActivityEvent[] = [
  { id: "act_01", actor: "Atlas AI", action: "ajustou o preço de", target: "Mouse Gamer Kortex Vantage", channel: "Mercado Livre", createdAt: daysAgo(MOCK_NOW, 0, 0.3) },
  { id: "act_02", actor: "Marina Vasquez", action: "vinculou custo em", target: "12 pedidos", channel: "Shopee", createdAt: daysAgo(MOCK_NOW, 0, 1.1) },
  { id: "act_03", actor: "Automação", action: "pausou o anúncio", target: "Umidificador Culina Mist 5L", channel: "Magalu", createdAt: daysAgo(MOCK_NOW, 0, 2.4) },
  { id: "act_04", actor: "Otávio Prado", action: "aprovou reposição de", target: "340 unidades", channel: "CD Extrema", createdAt: daysAgo(MOCK_NOW, 0, 5) },
  { id: "act_05", actor: "Atlas AI", action: "gerou relatório de", target: "margem por categoria", channel: "Relatórios", createdAt: daysAgo(MOCK_NOW, 0, 8.5) },
  { id: "act_06", actor: "Renan Delgado", action: "conectou a conta", target: "Atlas Prime", channel: "TikTok Shop", createdAt: daysAgo(MOCK_NOW, 1, 3) },
  { id: "act_07", actor: "Automação", action: "escalou o orçamento de", target: "Campanha Verão 7", channel: "Publicidade", createdAt: daysAgo(MOCK_NOW, 1, 6) },
  { id: "act_08", actor: "Marina Vasquez", action: "exportou", target: "conciliação financeira de julho", channel: "Financeiro", createdAt: daysAgo(MOCK_NOW, 2, 2) },
];

export const reports: ReportItem[] = [
  { id: "rep_01", name: "DRE gerencial consolidado", description: "Receita, custos, taxas e lucro por canal e por conta.", scope: "Todos os canais", format: "PDF", schedule: "Mensal · dia 1", updatedAt: daysAgo(MOCK_NOW, 3), size: "1,8 MB" },
  { id: "rep_02", name: "Curva ABC de produtos", description: "Classificação de SKUs por receita, margem e giro de estoque.", scope: "Catálogo completo", format: "XLSX", schedule: "Semanal · segunda", updatedAt: daysAgo(MOCK_NOW, 1), size: "612 KB" },
  { id: "rep_03", name: "Conciliação de repasses", description: "Comparativo entre valores previstos e efetivamente liquidados.", scope: "Mercado Livre, Shopee", format: "CSV", schedule: "Diário · 06h", updatedAt: daysAgo(MOCK_NOW, 0, 12), size: "284 KB" },
  { id: "rep_04", name: "Performance de mídia paga", description: "ACOS, ROAS, CPC e conversão por campanha e por SKU.", scope: "Publicidade", format: "PDF", schedule: "Semanal · sexta", updatedAt: daysAgo(MOCK_NOW, 4), size: "946 KB" },
  { id: "rep_05", name: "Ruptura e reposição sugerida", description: "Projeção de cobertura e lista de compra por fornecedor.", scope: "Estoque", format: "XLSX", schedule: "Semanal · quarta", updatedAt: daysAgo(MOCK_NOW, 2), size: "421 KB" },
  { id: "rep_06", name: "Radar de concorrência", description: "Variação de preço, Buy Box e reputação dos concorrentes monitorados.", scope: "24 vendedores", format: "PDF", schedule: "Diário · 08h", updatedAt: daysAgo(MOCK_NOW, 0, 10), size: "1,1 MB" },
  { id: "rep_07", name: "Coorte de recompra", description: "Retenção de compradores por safra semanal e ticket incremental.", scope: "Clientes", format: "XLSX", schedule: "Mensal · dia 5", updatedAt: daysAgo(MOCK_NOW, 9), size: "377 KB" },
  { id: "rep_08", name: "Auditoria de qualidade de dados", description: "Pedidos sem custo, SKUs sem vínculo e divergências de estoque.", scope: "Todos os canais", format: "CSV", schedule: "Diário · 07h", updatedAt: daysAgo(MOCK_NOW, 0, 11), size: "88 KB" },
];

export const tickets: TicketItem[] = [
  { id: "tkt_2841", subject: "Divergência no repasse do Mercado Livre em 12/07", status: "andamento", priority: "alta", channel: "Financeiro", updatedAt: daysAgo(MOCK_NOW, 0, 4), messages: 6 },
  { id: "tkt_2839", subject: "Como configurar margem mínima no repricing?", status: "aberto", priority: "media", channel: "Automações", updatedAt: daysAgo(MOCK_NOW, 0, 9), messages: 2 },
  { id: "tkt_2833", subject: "Sincronização da Shopee travada em 84%", status: "resolvido", priority: "alta", channel: "Integrações", updatedAt: daysAgo(MOCK_NOW, 2), messages: 11 },
  { id: "tkt_2826", subject: "Solicitação de novo usuário para o time de compras", status: "resolvido", priority: "baixa", channel: "Conta", updatedAt: daysAgo(MOCK_NOW, 5), messages: 4 },
  { id: "tkt_2812", subject: "Exportar relatório de curva ABC com custo médio", status: "resolvido", priority: "media", channel: "Relatórios", updatedAt: daysAgo(MOCK_NOW, 8), messages: 7 },
];

export const helpTopics = [
  { title: "Primeiros passos no Atlas", description: "Conecte seu primeiro canal e importe o histórico de pedidos.", articles: 12 },
  { title: "Precificação e margem", description: "Como o Atlas calcula lucro líquido, taxas e impostos.", articles: 18 },
  { title: "Automações", description: "Gatilhos, condições e limites de segurança do repricing.", articles: 9 },
  { title: "Integrações", description: "Requisitos e permissões de cada marketplace suportado.", articles: 15 },
  { title: "Financeiro", description: "Conciliação de repasses, retenções e antecipação.", articles: 11 },
  { title: "Atlas AI", description: "Como interpretar insights, confiança e impacto estimado.", articles: 7 },
];

export const faqItems = [
  {
    question: "Os dados exibidos nesta versão são reais?",
    answer:
      "Não. Esta é a fase de interface do Atlas Commerce: toda a informação vem de uma camada de dados simulados, gerada de forma determinística para que o comportamento visual seja idêntico a cada carregamento.",
  },
  {
    question: "Como o lucro líquido é calculado?",
    answer:
      "Receita bruta menos comissão do canal, frete, custo da mercadoria e impostos configurados. Pedidos sem custo vinculado são sinalizados porque distorcem o indicador para cima.",
  },
  {
    question: "O repricing pode vender abaixo do custo?",
    answer:
      "Não. Toda automação de preço respeita a margem mínima definida por SKU ou por categoria, e o Atlas bloqueia qualquer ajuste que ultrapasse esse limite.",
  },
  {
    question: "Quantos canais posso conectar?",
    answer:
      "O plano Scale permite contas ilimitadas em oito marketplaces. Nesta fase visual, cinco canais aparecem conectados e três disponíveis para conexão.",
  },
  {
    question: "Com que frequência os dados são sincronizados?",
    answer:
      "Pedidos e estoque a cada 5 minutos, anúncios e preços a cada 15 minutos, e repasses financeiros uma vez por dia após o fechamento do canal.",
  },
];

export const aiConversation: ChatMessage[] = [
  {
    id: "msg_01",
    role: "user",
    content: "Por que meu lucro caiu na última semana?",
    createdAt: daysAgo(MOCK_NOW, 0, 0.6),
  },
  {
    id: "msg_02",
    role: "assistant",
    content:
      "A queda de lucro concentra-se em três fatores. Primeiro, a categoria Periféricos perdeu Buy Box em 4 SKUs após o TechPrime Oficial reduzir preços — sozinha, ela responde por 46% da variação. Segundo, o investimento em mídia cresceu 22% enquanto a receita atribuída subiu apenas 6%, elevando o ACOS de 14,2% para 19,8%. Terceiro, 3 pedidos entraram sem custo vinculado, o que na verdade infla o lucro reportado: o número real é ainda um pouco menor.\n\nA ação de maior retorno é reativar o repricing defensivo nos 4 SKUs afetados. A simulação indica recuperação de aproximadamente R$ 9.180 em 30 dias, mantendo a margem acima do piso configurado.",
    createdAt: daysAgo(MOCK_NOW, 0, 0.58),
    metrics: [
      { label: "Lucro 7d", value: "R$ 18.412", delta: -12.4 },
      { label: "ACOS", value: "19,8%", delta: 5.6 },
      { label: "Buy Box", value: "62%", delta: -8.1 },
    ],
  },
  {
    id: "msg_03",
    role: "user",
    content: "Quais SKUs devo repor com urgência?",
    createdAt: daysAgo(MOCK_NOW, 0, 0.4),
  },
  {
    id: "msg_04",
    role: "assistant",
    content:
      "Cinco SKUs têm cobertura projetada abaixo do lead time do fornecedor. Em ordem de risco financeiro: Air Fryer Culina 8L (1,2 dia de cobertura, R$ 42,3 mil em receita mensal), Fone Bluetooth ANC Aurex Studio (11 dias), Teclado Kortex K68 (13 dias), Power Bank Volt 20000mAh (16 dias) e Smartwatch Nyx Fit Pro (19 dias).\n\nPosso gerar o pedido de compra consolidado por fornecedor, já considerando o lote mínimo e o histórico de atraso de cada um.",
    createdAt: daysAgo(MOCK_NOW, 0, 0.38),
    metrics: [
      { label: "SKUs em risco", value: "5" },
      { label: "Receita exposta", value: "R$ 96.240" },
      { label: "Confiança", value: "89%" },
    ],
  },
];

export const aiSuggestions = [
  "Qual canal tem a melhor margem líquida?",
  "Simule um aumento de 5% no preço dos top 10 SKUs",
  "Quais produtos estão perdendo Buy Box?",
  "Compare julho com junho por categoria",
  "Onde estou perdendo dinheiro com frete?",
  "Monte um plano para bater a meta do mês",
];

export const aiCapabilities = [
  { title: "Diagnóstico de margem", description: "Decompõe o lucro por canal, SKU e período apontando a causa raiz de cada variação." },
  { title: "Previsão de demanda", description: "Projeta giro e ruptura considerando sazonalidade, campanhas e lead time do fornecedor." },
  { title: "Simulação de cenários", description: "Testa preço, frete e investimento em mídia antes de aplicar a mudança na operação." },
  { title: "Vigilância competitiva", description: "Monitora preço, estoque e Buy Box dos concorrentes e sugere a resposta ideal." },
];
