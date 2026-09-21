import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { CATEGORIAS, PERFIS, type CategoriaId, type Perfil } from "@/data/perfis";

type Props = {
  onSelecionar: (perfil: Perfil) => void;
  perfilSelecionadoId: string | null;
};

export function SelecaoPerfil({ onSelecionar, perfilSelecionadoId }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<CategoriaId>("GESTAO");
  const [busca, setBusca] = useState("");
  const listaRef = useRef<HTMLDivElement | null>(null);
  const abasRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicador, setIndicador] = useState({ left: 0, width: 0 });

  const buscando = busca.trim().length > 0;

  useEffect(() => {
    const el = abasRef.current[abaAtiva];
    if (el) setIndicador({ left: el.offsetLeft, width: el.offsetWidth });
  }, [abaAtiva]);

  const contagem = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of PERFIS) mapa[p.categoria] = (mapa[p.categoria] ?? 0) + 1;
    return mapa;
  }, []);

  const perfisVisiveis = useMemo(() => {
    if (buscando) {
      const termo = busca.trim().toLowerCase();
      return PERFIS.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo),
      );
    }
    return PERFIS.filter((p) => p.categoria === abaAtiva);
  }, [busca, buscando, abaAtiva]);

  return (
    <section className="flex min-h-screen flex-col bg-eg-canvas px-6 py-10 lg:px-12 lg:py-14">
      <header>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-eg-accent">ACESSO AO SISTEMA</p>
        <h2 className="mt-2 text-[26px] font-semibold tracking-tight text-eg-text">
          Selecione seu perfil de acesso
        </h2>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-eg-muted">
          O perfil define os módulos e permissões disponíveis para você.
        </p>
      </header>

      {/* Busca (acima da barra de abas) */}
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-eg-ink-soft" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cargo ou perfil..."
          aria-label="Buscar cargo ou perfil"
          className="w-full rounded-lg border border-eg-border bg-eg-surface py-3 pl-11 pr-10 text-sm text-eg-text outline-none transition-colors placeholder:text-eg-muted focus:border-eg-accent focus:ring-1 focus:ring-eg-accent"
        />
        {buscando && (
          <button
            type="button"
            onClick={() => setBusca("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-eg-muted transition-colors hover:bg-eg-surface-hover hover:text-eg-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="sticky top-3 z-20 mt-4">
        <div
          className={`relative flex gap-1 overflow-x-auto rounded-lg border border-eg-border bg-eg-surface p-1 pb-2 transition-opacity [scrollbar-color:var(--eg-border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-eg-border [&::-webkit-scrollbar-track]:bg-transparent ${
            buscando ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
          style={{ scrollSnapType: "x mandatory" }}
          role="tablist"
          aria-label="Categorias de perfil"
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-md bg-eg-accent transition-all duration-200 ease-out"
            style={{
              left: indicador.left,
              width: indicador.width,
            }}
          />
          {CATEGORIAS.map((cat) => {
            const ativa = cat.id === abaAtiva && !buscando;
            return (
              <button
                key={cat.id}
                ref={(el) => {
                  abasRef.current[cat.id] = el;
                }}
                role="tab"
                aria-selected={ativa}
                type="button"
                disabled={buscando}
                onClick={() => setAbaAtiva(cat.id)}
                style={{ scrollSnapAlign: "center" }}
                className={`relative z-10 flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-medium tracking-wide transition-colors ${
                  ativa
                    ? "text-zinc-950"
                    : "text-eg-muted hover:bg-eg-surface-hover hover:text-eg-text"
                }`}
              >
                {cat.label}
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                    ativa ? "bg-zinc-950/15 text-zinc-950" : "bg-eg-surface-hover text-eg-muted"
                  }`}
                >
                  {contagem[cat.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div
        ref={listaRef}
        key={buscando ? `busca-${busca}` : abaAtiva}
        className="eg-fade-in mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {perfisVisiveis.map((perfil) => {
          const Icone = perfil.icone;
          const selecionado = perfil.id === perfilSelecionadoId;
          return (
            <article
              key={perfil.id}
              className={`group flex min-h-40 items-start gap-4 rounded-lg border bg-eg-surface-raised p-5 transition-colors duration-150 hover:bg-eg-surface-hover ${
                selecionado
                  ? "border-eg-accent"
                  : "border-eg-border hover:border-zinc-600"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-eg-border bg-eg-surface">
                <Icone className="h-[18px] w-[18px] stroke-[1.75] text-eg-muted transition-colors group-hover:text-eg-text" />
              </span>
              <span className="min-w-0 flex-1">
                {buscando && (
                  <span className="mb-2 inline-block rounded bg-eg-accent-soft px-2 py-0.5 text-[9px] font-semibold tracking-wider text-eg-accent">
                    {CATEGORIAS.find((c) => c.id === perfil.categoria)?.label}
                  </span>
                )}
                <span className="block text-sm font-semibold text-eg-text">{perfil.nome}</span>
                <span className="mt-1 block text-xs leading-5 text-eg-muted">
                  {perfil.descricao}
                </span>
                <button
                  type="button"
                  onClick={() => onSelecionar(perfil)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-eg-border bg-eg-surface px-3 py-2 text-xs font-semibold text-eg-text transition-colors hover:bg-eg-surface-hover hover:text-eg-accent focus:outline-none focus-visible:border-eg-accent"
                >
                  Abrir módulo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            </article>
          );
        })}
        {perfisVisiveis.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-eg-muted">
            Nenhum perfil encontrado para “{busca}”.
          </p>
        )}
      </div>
    </section>
  );
}
