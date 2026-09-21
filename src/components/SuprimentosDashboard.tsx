import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Plus,
  ReceiptText,
  Send,
  ShoppingCart,
  Timer,
  Truck,
} from "lucide-react";

type Props = { onVoltar: () => void };

type StatusItem = "Normal" | "Atenção" | "Crítico";
type StatusPedido = "Em cotação" | "Aguardando aprovação" | "Enviado" | "Em trânsito" | "Recebido";

const estoqueInicial = [
  { item: "Cabo multiplexado 3x35+35 mm²", categoria: "Materiais elétricos", saldo: 180, ponto: 260, unidade: "m", status: "Crítico" as StatusItem, obra: "DMP/A.SUL.25.00419" },
  { item: "EPI — luva isolante classe 2", categoria: "EPI", saldo: 14, ponto: 20, unidade: "par", status: "Atenção" as StatusItem, obra: "Estoque central" },
  { item: "Conector perfurante 35–95 mm²", categoria: "Materiais elétricos", saldo: 94, ponto: 80, unidade: "un.", status: "Normal" as StatusItem, obra: "Estoque central" },
  { item: "Óleo hidráulico 68", categoria: "Frota", saldo: 8, ponto: 12, unidade: "L", status: "Crítico" as StatusItem, obra: "Base Sul" },
];

const pedidosIniciais = [
  { id: "RC-2026-0148", item: "Cabo multiplexado 3x35+35 mm²", obra: "DMP/A.SUL.25.00419", origem: "Automática", valor: 18450, fornecedor: "EletroSul Distribuidora", status: "Aguardando aprovação" as StatusPedido, prazo: "20/09" },
  { id: "PO-2026-0081", item: "EPI — luva isolante classe 2", obra: "Estoque central", origem: "Programada", valor: 3280, fornecedor: "Protege EPI", status: "Em trânsito" as StatusPedido, prazo: "18/09" },
  { id: "RC-2026-0147", item: "Óleo hidráulico 68", obra: "Base Sul", origem: "Manual", valor: 980, fornecedor: "Auto Peças Norte", status: "Em cotação" as StatusPedido, prazo: "—" },
];

const badge = (status: string) => {
  const map: Record<string, string> = {
    Normal: "bg-lime-100 text-lime-800",
    Atenção: "bg-amber-100 text-amber-700",
    Crítico: "bg-red-100 text-red-700",
    "Em cotação": "bg-amber-100 text-amber-800",
    "Aguardando aprovação": "bg-amber-100 text-amber-700",
    Enviado: "bg-amber-100 text-amber-800",
    "Em trânsito": "bg-amber-100 text-amber-800",
    Recebido: "bg-lime-100 text-lime-800",
  };
  return map[status] ?? "bg-amber-100 text-stone-700";
};

const dinheiro = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function SuprimentosDashboard({ onVoltar }: Props) {
  const [estoque, setEstoque] = useState(estoqueInicial);
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [filtro, setFiltro] = useState<"Todos" | StatusItem>("Todos");
  const [notificacoes, setNotificacoes] = useState<string[]>([]);
  const [novaRC, setNovaRC] = useState({ item: "Cabo multiplexado 3x35+35 mm²", quantidade: "120", obra: "DMP/A.SUL.25.00419", justificativa: "Reposição para obra programada" });

  const alertas = useMemo(() => estoque.filter((item) => item.status !== "Normal"), [estoque]);
  const itensFiltrados = filtro === "Todos" ? estoque : estoque.filter((item) => item.status === filtro);

  function gerarRCAutomatica(item: (typeof estoqueInicial)[number]) {
    const existente = pedidos.some((pedido) => pedido.item === item.item && pedido.status !== "Recebido");
    if (existente) {
      setNotificacoes((atual) => [`${item.item}: já existe uma requisição aberta para este item.`, ...atual]);
      return;
    }
    setPedidos((atual) => [{ id: `RC-2026-${String(149 + atual.length).padStart(4, "0")}`, item: item.item, obra: item.obra, origem: "Automática", valor: 4200, fornecedor: "Sugestão por histórico", status: "Aguardando aprovação", prazo: "A definir" }, ...atual]);
    setNotificacoes((atual) => [`RC automática criada para ${item.item}. O comprador foi notificado.`, ...atual]);
  }

  function criarRCManual() {
    setPedidos((atual) => [{ id: `RC-2026-${String(151 + atual.length).padStart(4, "0")}`, item: novaRC.item, obra: novaRC.obra, origem: "Manual", valor: 0, fornecedor: "A cotar", status: "Em cotação", prazo: "A definir" }, ...atual]);
    setNotificacoes((atual) => [`Requisição manual criada: ${novaRC.quantidade} unidades de ${novaRC.item}.`, ...atual]);
  }

  function aprovar(pedidoId: string) {
    setPedidos((atual) => atual.map((pedido) => pedido.id === pedidoId ? { ...pedido, status: "Enviado" } : pedido));
    setNotificacoes((atual) => [`${pedidoId}: aprovado dentro da alçada e enviado ao fornecedor.`, ...atual]);
  }

  function receber(pedidoId: string) {
    setPedidos((atual) => atual.map((pedido) => pedido.id === pedidoId ? { ...pedido, status: "Recebido" } : pedido));
    setNotificacoes((atual) => [`${pedidoId}: recebimento conferido; entrada no estoque e conferência de NF simuladas.`, ...atual]);
  }

  return (
    <main className="min-h-screen bg-amber-50 p-5 sm:p-8">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-4 rounded-3xl bg-amber-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-amber-200">ELETROGESTOR · SUPRIMENTOS</p>
          <h1 className="mt-2 text-3xl font-bold">Suprimentos / Compras</h1>
          <p className="mt-1 text-sm text-amber-100">Reposição, cotação, aprovação e acompanhamento de pedidos.</p>
        </div>
        <button onClick={onVoltar} className="rounded-xl border border-amber-700 px-4 py-2 text-sm font-semibold"><ArrowLeft className="mr-1 inline h-4 w-4" /> Perfis</button>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={<ClipboardList />} valor={String(alertas.length)} texto="itens em alerta" cor="text-red-600" />
        <Kpi icon={<Timer />} valor="4,8 dias" texto="lead time médio" cor="text-amber-800" />
        <Kpi icon={<Truck />} valor="92%" texto="entregas no prazo" cor="text-lime-800" />
        <Kpi icon={<ShoppingCart />} valor="R$ 22,7 mil" texto="compras em aberto" cor="text-amber-800" />
        <Kpi icon={<ReceiptText />} valor="R$ 1.860" texto="economia em cotações" cor="text-amber-700" />
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div><h2 className="text-xl font-bold text-stone-900">Estoque e ponto de pedido</h2><p className="text-sm text-stone-500">Alertas calculados por saldo, consumo e estoque mínimo.</p></div>
            <div className="flex gap-2">{(["Todos", "Crítico", "Atenção", "Normal"] as const).map((opcao) => <button key={opcao} onClick={() => setFiltro(opcao)} className={`rounded-lg px-3 py-2 text-xs font-bold ${filtro === opcao ? "bg-amber-950 text-white" : "bg-amber-100 text-stone-600"}`}>{opcao}</button>)}</div>
          </div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b text-xs uppercase text-stone-500"><tr><th className="pb-3">Item</th><th className="pb-3">Obra / local</th><th className="pb-3">Saldo</th><th className="pb-3">Ponto de pedido</th><th className="pb-3">Status</th><th className="pb-3"></th></tr></thead><tbody>{itensFiltrados.map((item) => <tr key={item.item} className="border-b last:border-0"><td className="py-4 font-semibold text-stone-800"><p>{item.item}</p><span className="text-xs font-normal text-stone-500">{item.categoria}</span></td><td className="py-4 text-stone-600">{item.obra}</td><td className="py-4 font-semibold">{item.saldo} {item.unidade}</td><td className="py-4">{item.ponto} {item.unidade}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge(item.status)}`}>{item.status}</span></td><td className="py-4">{item.status !== "Normal" && <button onClick={() => gerarRCAutomatica(item)} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white">Gerar RC</button>}</td></tr>)}</tbody></table></div>
        </div>

        <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
          <div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-amber-600" /><h2 className="text-lg font-bold">Automações ativas</h2></div>
          <div className="mt-4 space-y-3">{[
            ["RC por ponto de pedido", "Ativa", "bg-lime-100 text-lime-800"],
            ["Roteamento por alçada", "Aciona acima de R$ 5 mil", "bg-amber-100 text-amber-800"],
            ["Alerta de ruptura crítica", "2 alertas enviados", "bg-red-100 text-red-700"],
            ["Sugestão por histórico", "Pronta para cotação", "bg-amber-100 text-amber-800"],
          ].map(([titulo, detalhe, cor]) => <div key={titulo} className="rounded-xl border border-amber-200 p-3"><div className="flex items-center justify-between gap-2"><b className="text-sm text-stone-800">{titulo}</b><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${cor}`}>{detalhe}</span></div></div>)}</div>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">As automações são demonstrativas: o backend fará os envios e atualizações reais amanhã.</p>
        </aside>
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 xl:grid-cols-[1fr_1.6fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
          <div className="flex items-center gap-2"><Plus className="h-5 w-5 text-amber-800" /><h2 className="text-lg font-bold">Nova requisição de compra</h2></div>
          <p className="mt-1 text-sm text-stone-500">Solicitação avulsa vinculada a uma obra.</p>
          <div className="mt-4 space-y-3"><label className="block text-xs font-bold text-stone-600">Item<select value={novaRC.item} onChange={(e) => setNovaRC({ ...novaRC, item: e.target.value })} className="mt-1 w-full rounded-lg border border-amber-300 p-2 text-sm font-normal"><option>Cabo multiplexado 3x35+35 mm²</option><option>EPI — luva isolante classe 2</option><option>Óleo hidráulico 68</option><option>Ferramenta de consumo</option></select></label><label className="block text-xs font-bold text-stone-600">Quantidade<input value={novaRC.quantidade} onChange={(e) => setNovaRC({ ...novaRC, quantidade: e.target.value })} className="mt-1 w-full rounded-lg border border-amber-300 p-2 text-sm font-normal" /></label><label className="block text-xs font-bold text-stone-600">Obra vinculada<select value={novaRC.obra} onChange={(e) => setNovaRC({ ...novaRC, obra: e.target.value })} className="mt-1 w-full rounded-lg border border-amber-300 p-2 text-sm font-normal"><option>DMP/A.SUL.25.00419</option><option>CTM/A.NORTE.25.00118</option><option>Estoque central</option></select></label><label className="block text-xs font-bold text-stone-600">Justificativa<textarea value={novaRC.justificativa} onChange={(e) => setNovaRC({ ...novaRC, justificativa: e.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-amber-300 p-2 text-sm font-normal" /></label><button onClick={criarRCManual} className="w-full rounded-lg bg-amber-950 px-4 py-2.5 text-sm font-bold text-white"><ClipboardList className="mr-1 inline h-4 w-4" /> Criar requisição</button></div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Requisições e pedidos</h2><p className="text-sm text-stone-500">Fluxo de cotação, aprovação, entrega e recebimento.</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-stone-600">{pedidos.length} em acompanhamento</span></div>
          <div className="mt-4 space-y-3">{pedidos.map((pedido) => <article key={pedido.id} className="rounded-xl border border-amber-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><b className="text-sm">{pedido.id}</b><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge(pedido.status)}`}>{pedido.status}</span></div><p className="mt-2 font-semibold text-stone-800">{pedido.item}</p><p className="mt-1 text-xs text-stone-500">{pedido.obra} · {pedido.origem} · {pedido.fornecedor}</p></div><div className="text-left sm:text-right"><p className="font-bold text-stone-800">{pedido.valor ? dinheiro(pedido.valor) : "A cotar"}</p><p className="text-xs text-stone-500">Prazo: {pedido.prazo}</p></div></div><div className="mt-3 flex flex-wrap gap-2">{pedido.status === "Aguardando aprovação" && <button onClick={() => aprovar(pedido.id)} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="mr-1 inline h-4 w-4" /> Aprovar</button>}{pedido.status === "Em cotação" && <button onClick={() => setNotificacoes((atual) => [`${pedido.id}: cotação enviada a 3 fornecedores homologados.`, ...atual])} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white"><Send className="mr-1 inline h-4 w-4" /> Enviar cotação</button>}{pedido.status === "Em trânsito" && <button onClick={() => receber(pedido.id)} className="rounded-lg bg-lime-800 px-3 py-2 text-xs font-bold text-white"><FileCheck2 className="mr-1 inline h-4 w-4" /> Conferir recebimento</button>}</div></article>)}</div>
        </section>
      </section>

      <section className="mx-auto mt-6 max-w-7xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200"><h2 className="font-bold">Central de atividades</h2><p className="mt-1 text-sm text-stone-500">Eventos desta demonstração.</p><div className="mt-4 space-y-2">{notificacoes.length ? notificacoes.map((texto, indice) => <p key={`${texto}-${indice}`} className="rounded-lg bg-amber-50 p-3 text-sm text-stone-700">{texto}</p>) : <p className="rounded-lg bg-amber-50 p-3 text-sm text-stone-500">Gere uma RC, crie uma requisição ou avance um pedido para testar o fluxo visual.</p>}</div></section>
    </main>
  );
}

function Kpi({ icon, valor, texto, cor }: { icon: React.ReactNode; valor: string; texto: string; cor: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-200"><div className={cor}>{icon}</div><p className={`mt-3 text-2xl font-bold ${cor}`}>{valor}</p><p className="text-sm text-stone-500">{texto}</p></div>;
}
