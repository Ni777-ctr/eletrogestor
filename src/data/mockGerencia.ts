export type StatusObra = "proposta" | "contratada" | "em_execucao" | "concluida";
export type Semaforo = "ok" | "atencao" | "critico";

export type Obra = {
  codigo: string;
  nome: string;
  equipe: string;
  status: StatusObra;
  valorContrato: number;
  custoPrevisto: number;
  custoRealizado: number;
  avancoPrevisto: number;
  avancoRealizado: number;
  necsPlanejados: number;
  necsExecutados: number;
  diasContratada?: number;
};

export const mockObras: Obra[] = [
  { codigo: "DMP/A.SUL.25.00419", nome: "Rede MT — Trecho A", equipe: "Equipe Alfa", status: "em_execucao", valorContrato: 500000, custoPrevisto: 350000, custoRealizado: 420000, avancoPrevisto: 70, avancoRealizado: 60, necsPlanejados: 7000, necsExecutados: 4200 },
  { codigo: "DMP/A.SUL.25.00420", nome: "Poste e Transformador — Zona Sul", equipe: "Equipe Beta", status: "em_execucao", valorContrato: 120000, custoPrevisto: 90000, custoRealizado: 98000, avancoPrevisto: 50, avancoRealizado: 55, necsPlanejados: 4500, necsExecutados: 2500 },
  { codigo: "CTM/A.NORTE.25.00118", nome: "Extensão de Rede Rural", equipe: "Equipe Gama", status: "contratada", valorContrato: 200000, custoPrevisto: 150000, custoRealizado: 0, avancoPrevisto: 0, avancoRealizado: 0, necsPlanejados: 3800, necsExecutados: 0, diasContratada: 25 },
  { codigo: "MNT/A.SUL.24.00087", nome: "Manutenção Preventiva — BT", equipe: "Equipe Alfa", status: "concluida", valorContrato: 80000, custoPrevisto: 60000, custoRealizado: 58000, avancoPrevisto: 100, avancoRealizado: 100, necsPlanejados: 2600, necsExecutados: 2600 },
  { codigo: "RDU/A.LESTE.25.00061", nome: "Rede Subterrânea — Centro", equipe: "Equipe Beta", status: "proposta", valorContrato: 340000, custoPrevisto: 245000, custoRealizado: 0, avancoPrevisto: 0, avancoRealizado: 0, necsPlanejados: 2100, necsExecutados: 0 },
];

export const META_MENSAL_NECS = 20000;
export const VALOR_REFERENCIA_NEC = 202;

export const mockMarcos = [
  { obra: "DMP/A.SUL.25.00419", marco: "Lançamento de cabos", diasAtraso: 8, concluido: false, faturado: false },
  { obra: "DMP/A.SUL.25.00419", marco: "Escavação concluída", concluido: true, recente: true, faturado: false },
  { obra: "DMP/A.SUL.25.00420", marco: "Instalação do transformador", concluido: true, recente: true, faturado: true },
  { obra: "MNT/A.SUL.24.00087", marco: "Entrega final", concluido: true, recente: false, faturado: false },
];

export const mockBloqueados = [
  { trabalhador: "João Silva", equipe: "Equipe Alfa", motivos: ["NR-10 vencida"] },
  { trabalhador: "Maria Souza", equipe: "Equipe Beta", motivos: ["ASO vencido"] },
];

export const mockStopWork = [
  { obra: "DMP/A.SUL.25.00419", motivo: "Falta de EPI adequado", status: "Retomado" },
  { obra: "DMP/A.SUL.25.00420", motivo: "Condição climática de risco", status: "Parado" },
];

export const mockScoreEquipes = [
  { equipe: "Equipe Gama", prazo: 5, qualidade: 5, seguranca: 5 },
  { equipe: "Equipe Beta", prazo: 4.5, qualidade: 4, seguranca: 5 },
  { equipe: "Equipe Alfa", prazo: 3.5, qualidade: 4.5, seguranca: 4 },
];

export function semaforoFinanceiro(obra: Obra): Semaforo {
  const desvio = obra.custoPrevisto === 0 ? 0 : ((obra.custoRealizado - obra.custoPrevisto) / obra.custoPrevisto) * 100;
  return desvio > 15 ? "critico" : desvio > 5 ? "atencao" : "ok";
}
