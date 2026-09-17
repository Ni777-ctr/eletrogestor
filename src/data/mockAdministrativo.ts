export type DocumentoMock = { id: string; tipo: string; titular: string; diasParaVencer: number | null };
export type AprovacaoMock = { id: string; titulo: string; solicitante: string; aprovador: string; status: "Pendente" | "Aprovado" | "Rejeitado" };
export type ProcessoRHMock = { id: string; colaborador: string; tipo: "Admissão" | "Demissão"; itens: { descricao: string; concluido: boolean }[] };

export const documentosMock: DocumentoMock[] = [
  { id: "doc-1", tipo: "ASO", titular: "Maria Souza", diasParaVencer: -3 },
  { id: "doc-2", tipo: "NR-10", titular: "João Silva", diasParaVencer: 7 },
  { id: "doc-3", tipo: "CNH", titular: "Carlos Lima", diasParaVencer: 15 },
  { id: "doc-4", tipo: "Licença", titular: "AmperVolt Engenharia", diasParaVencer: 28 },
];

export const contratosMock = [
  { id: "cont-1", fornecedor: "EPI Protege Ltda.", objeto: "Fornecimento de EPIs", diasParaVencer: 12, renovacaoAutomatica: false },
  { id: "cont-2", fornecedor: "LocaFrota Serviços", objeto: "Locação de veículos", diasParaVencer: 25, renovacaoAutomatica: true },
];

export const aprovacoesMock: AprovacaoMock[] = [
  { id: "apr-1", titulo: "Compra de EPIs — setembro", solicitante: "Segurança do Trabalho", aprovador: "Gerência Geral", status: "Pendente" },
  { id: "apr-2", titulo: "Renovação contrato LocaFrota", solicitante: "Administrativo", aprovador: "Diretoria", status: "Pendente" },
  { id: "apr-3", titulo: "Reembolso de combustível", solicitante: "Equipe Alfa", aprovador: "Administrativo", status: "Aprovado" },
];

export const processosRHMock: ProcessoRHMock[] = [
  { id: "rh-1", colaborador: "Ana Martins", tipo: "Admissão", itens: [
    { descricao: "Exame admissional (ASO)", concluido: true },
    { descricao: "Entrega de EPIs", concluido: false },
    { descricao: "Treinamento NR-10 / NR-35", concluido: false },
    { descricao: "Cadastro no eSocial", concluido: true },
  ] },
  { id: "rh-2", colaborador: "Paulo Costa", tipo: "Demissão", itens: [
    { descricao: "Exame demissional (ASO)", concluido: false },
    { descricao: "Devolução de EPIs e equipamentos", concluido: false },
    { descricao: "Baixa no eSocial", concluido: false },
  ] },
];
