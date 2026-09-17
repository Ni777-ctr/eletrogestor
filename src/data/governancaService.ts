export const TETO_MAXIMO_DESCONTO_ANTECIPACAO = 5;
export type AuditoriaCentral = { data: string; bot: string; acao: string; entidade: string; antes: string; depois: string; responsavel: string };
export const auditoriaCentral: AuditoriaCentral[] = [];
export function registrarAuditoria(item: Omit<AuditoriaCentral, "data">) { auditoriaCentral.unshift({ data: new Date().toLocaleString("pt-BR"), ...item }); }
