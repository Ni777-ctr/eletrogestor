/**
 * Camada de acesso aos endpoints do backend EletroGestor (FastAPI - main.py).
 * A URL base fica em variavel de ambiente: VITE_API_URL
 * (ex.: VITE_API_URL=http://localhost:8000)
 */

export const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Falha em ${path}: ${res.status}`);
  return (await res.json()) as T;
}

/* ---------- GET /automacao/painel ---------- */
export type PainelAutomacao = {
  dispositivos_automacao: number;
  subestacoes_digitais: number;
  eventos_self_healing: number;
  percentual_restabelecimento_automatico: number;
  pontos_criticos_vegetacao_abertos: number;
};
export const getPainelAutomacao = () => get<PainelAutomacao>("/automacao/painel");

/* ---------- GET /automacao/self-healing/indicadores ---------- */
export type IndicadoresSelfHealing = {
  total_eventos: number;
  resolvidos_automaticamente: number;
  percentual_resolucao_automatica: number;
  tempo_medio_restauracao_segundos: number | null;
};
export const getIndicadoresSelfHealing = () =>
  get<IndicadoresSelfHealing>("/automacao/self-healing/indicadores");

/* ---------- GET /obras ---------- */
export type Obra = {
  id: number;
  wl: string;
  descricao?: string | null;
  regional?: string | null;
  equipe?: string | null;
};
export const getObras = () => get<Obra[]>("/obras");

/* ---------- GET /subestacoes/{id}/status ---------- */
export type LeituraSubestacao = {
  id: number;
  subestacao_id: number;
  registrado_em: string;
  temperatura_c: number | null;
  carga_percentual: number | null;
  vibracao_mm_s: number | null;
  alerta_gerado: boolean;
};
export type StatusSubestacao = {
  subestacao: string;
  operacao_remota_ativa: boolean;
  ultima_leitura: LeituraSubestacao | null;
  alertas_ativos: string[];
};
export const getStatusSubestacao = (subestacaoId: number) =>
  get<StatusSubestacao>(`/subestacoes/${subestacaoId}/status`);

/* ---------- GET /vegetacao/pontos-criticos ---------- */
export type PontoVegetacao = {
  id: number;
  risco: string;
  resolvido: boolean;
};
export const getPontosCriticosVegetacao = () =>
  get<PontoVegetacao[]>("/vegetacao/pontos-criticos");

/* ---------- GET /dashboard ---------- */
export type Dashboard = {
  obras: {
    total: number;
    concluidas: number;
    pendentes: number;
    em_execucao: number;
    aguardando_inventario: number;
  };
  materiais: { total_itens: number; saldo_total: number };
  produtividade_por_equipe: { equipe: string; total: number; concluidas: number }[];
  faturamento: { pendencias_abertas: number };
};
export const getDashboard = (regional?: string) =>
  get<Dashboard>(`/dashboard${regional ? `?regional=${encodeURIComponent(regional)}` : ""}`);

/* ---------- GET /relatorios/resumo-diario ---------- */
export const getResumoDiario = () => get<unknown>("/relatorios/resumo-diario");
