import {
  ShieldCheck,
  Crown,
  FileText,
  Receipt,
  CalendarRange,
  ClipboardCheck,
  HardHat,
  Users,
  Search,
  Map,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
  FolderInput,
  FolderOutput,
  ShieldAlert,
  BadgeCheck,
  Eye,
  Code2,
  Bug,
  type LucideIcon,
} from "lucide-react";

export type CategoriaId = "GESTAO" | "OPERACAO" | "SUPORTE" | "TECNICO";

export type Perfil = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaId;
  icone: LucideIcon;
};

export const CATEGORIAS: { id: CategoriaId; label: string }[] = [
  { id: "GESTAO", label: "GESTÃO" },
  { id: "OPERACAO", label: "OPERAÇÃO" },
  { id: "SUPORTE", label: "SUPORTE" },
  { id: "TECNICO", label: "TÉCNICO" },
];

export const PERFIS: Perfil[] = [
  // GESTÃO (4)
  {
    id: "administrador",
    nome: "Administrador",
    descricao: "Acesso total ao sistema, usuários e parâmetros.",
    categoria: "GESTAO",
    icone: ShieldCheck,
  },
  {
    id: "gerencia-geral",
    nome: "Gerência Geral",
    descricao: "Visão consolidada de obras, produtividade e indicadores.",
    categoria: "GESTAO",
    icone: Crown,
  },
  {
    id: "administrativo",
    nome: "Administrativo",
    descricao: "Rotinas administrativas, cadastros e documentos.",
    categoria: "GESTAO",
    icone: FileText,
  },
  {
    id: "faturamento-medicao",
    nome: "Faturamento / Medição",
    descricao: "Medição de obras concluídas e pendências de faturamento.",
    categoria: "GESTAO",
    icone: Receipt,
  },

  // OPERAÇÃO (6)
  {
    id: "programacao",
    nome: "Programação",
    descricao: "Programação diária de obras, equipes e veículos.",
    categoria: "OPERACAO",
    icone: CalendarRange,
  },
  {
    id: "supervisor",
    nome: "Supervisor",
    descricao: "Acompanhamento da execução e liberação de serviços.",
    categoria: "OPERACAO",
    icone: ClipboardCheck,
  },
  {
    id: "encarregado",
    nome: "Encarregado",
    descricao: "Condução da equipe em campo e registro de execução.",
    categoria: "OPERACAO",
    icone: HardHat,
  },
  {
    id: "equipe-campo",
    nome: "Equipe de Campo",
    descricao: "Checklists, evidências fotográficas e apontamentos.",
    categoria: "OPERACAO",
    icone: Users,
  },
  {
    id: "viabilizacao",
    nome: "Viabilização",
    descricao: "Análise de viabilidade técnica antes da execução.",
    categoria: "OPERACAO",
    icone: Search,
  },
  {
    id: "planejamento",
    nome: "Planejamento",
    descricao: "Roteirização, clusterização e previsão de demanda.",
    categoria: "OPERACAO",
    icone: Map,
  },

  // SUPORTE (8)
  {
    id: "almoxarifado",
    nome: "Almoxarifado",
    descricao: "Retirada, instalação e devolução de materiais.",
    categoria: "SUPORTE",
    icone: Package,
  },
  {
    id: "suprimentos-compras",
    nome: "Suprimentos / Compras",
    descricao: "Reposição de estoque mínimo e aquisição de itens.",
    categoria: "SUPORTE",
    icone: ShoppingCart,
  },
  {
    id: "logistica-frota",
    nome: "Logística / Frota",
    descricao: "Gestão de veículos, deslocamentos e disponibilidade.",
    categoria: "SUPORTE",
    icone: Truck,
  },
  {
    id: "inventario",
    nome: "Inventário",
    descricao: "Conferência de inventário e reconciliação de saldos.",
    categoria: "SUPORTE",
    icone: Boxes,
  },
  {
    id: "documentacao-pre-obra",
    nome: "Documentação Pré-Obra",
    descricao: "Pré-APR, projetos e liberações antes do início.",
    categoria: "SUPORTE",
    icone: FolderInput,
  },
  {
    id: "documentacao-pos-obra",
    nome: "Documentação Pós-Obra",
    descricao: "As-built, evidências e encerramento documental.",
    categoria: "SUPORTE",
    icone: FolderOutput,
  },
  {
    id: "seguranca-trabalho",
    nome: "Segurança do Trabalho",
    descricao: "Habilitações, zonas de segurança e bloqueios de Pré-APR.",
    categoria: "SUPORTE",
    icone: ShieldAlert,
  },
  {
    id: "qualidade",
    nome: "Qualidade",
    descricao: "Auditoria de execução, divergências e conformidade.",
    categoria: "SUPORTE",
    icone: BadgeCheck,
  },

  // TÉCNICO (3)
  {
    id: "visualizador",
    nome: "Visualizador",
    descricao: "Acesso somente leitura aos painéis e relatórios.",
    categoria: "TECNICO",
    icone: Eye,
  },
  {
    id: "desenvolvedor",
    nome: "Desenvolvedor",
    descricao: "Integrações, endpoints e manutenção do sistema.",
    categoria: "TECNICO",
    icone: Code2,
  },
  {
    id: "tester",
    nome: "Tester",
    descricao: "Validação de fluxos, homologação e testes de regressão.",
    categoria: "TECNICO",
    icone: Bug,
  },
];
