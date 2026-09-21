/**
 * Camada temporária de fluxo entre módulos.
 *
 * Mantém a trilha de eventos no navegador enquanto o backend não está conectado.
 * Quando a API estiver disponível, estas funções devem passar a chamar os endpoints
 * do backend, preservando os mesmos contratos de dados.
 */
export type EtapaFluxo =
  | "viabilizacao"
  | "documentacao_pre_obra"
  | "programacao"
  | "campo"
  | "almoxarifado"
  | "inventario"
  | "faturamento"
  | "administrativo";

export type EventoFluxoObra = {
  id: string;
  obra: string;
  origem: EtapaFluxo;
  destino: EtapaFluxo;
  acao: string;
  criadoEm: string;
  dados?: Record<string, string | number | boolean>;
};

const CHAVE = "eletrogestor:fluxo-obras:v1";

function lerEventos(): EventoFluxoObra[] {
  if (typeof window === "undefined") return [];
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor ? (JSON.parse(valor) as EventoFluxoObra[]) : [];
  } catch {
    return [];
  }
}

function salvarEventos(eventos: EventoFluxoObra[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, JSON.stringify(eventos.slice(0, 300)));
  window.dispatchEvent(new CustomEvent("eletrogestor:fluxo-atualizado"));
}

export function registrarEventoFluxo(evento: Omit<EventoFluxoObra, "id" | "criadoEm">) {
  const registro: EventoFluxoObra = {
    ...evento,
    id: `fluxo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    criadoEm: new Date().toISOString(),
  };
  salvarEventos([registro, ...lerEventos()]);
  return registro;
}

export function obterFluxoDaObra(obra: string) {
  return lerEventos().filter((evento) => evento.obra === obra);
}

export function registrarProgramacao(obra: string, equipe: string, veiculo: string, data: string) {
  return registrarEventoFluxo({
    obra,
    origem: "programacao",
    destino: "campo",
    acao: "Programação lançada",
    dados: { equipe, veiculo: veiculo || "sem veículo", data },
  });
}

export function registrarMedicaoAprovada(obra: string, medicaoId: string) {
  return registrarEventoFluxo({
    obra,
    origem: "campo",
    destino: "faturamento",
    acao: "Medição aprovada",
    dados: { medicaoId },
  });
}

export function registrarFaturaEmitida(obra: string, faturaId: string, valor: number) {
  return registrarEventoFluxo({
    obra,
    origem: "faturamento",
    destino: "administrativo",
    acao: "Fatura emitida",
    dados: { faturaId, valor },
  });
}

export function registrarPagamentoConciliado(obra: string, faturaId: string, valor: number) {
  return registrarEventoFluxo({
    obra,
    origem: "faturamento",
    destino: "administrativo",
    acao: "Pagamento conciliado",
    dados: { faturaId, valor },
  });
}
