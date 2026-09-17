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
    <section className="flex min-h-screen flex-col bg-eg-surface px-6 py-10 lg:px-12 lg:py-14">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-eg-accent">PASSO 1 DE 2</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-eg-ink">
          Selecione seu perfil de acesso
        </h2>
        <p className="mt-1.5 text-sm text-eg-ink-soft">
          O perfil define os módulos e permissões disponíveis para você.
        </p>
      </header>

      {/* Busca (acima da barra de abas) */}
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-eg-ink-soft" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar perfil..."
          aria-label="Buscar perfil"
          className="w-full rounded-full border border-eg-border bg-eg-surface py-3 pl-11 pr-10 text-sm text-eg-ink outline-none transition-colors placeholder:text-eg-ink-soft/70 focus:border-eg-accent"
        />
        {buscando && (
          <button
            type="button"
            onClick={() => setBusca("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-eg-ink-soft transition-colors hover:bg-eg-accent-soft"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Barra de abas flutuante */}
      <div className="sticky top-3 z-20 mt-4">
        <div
          className={`relative flex gap-1 overflow-x-auto rounded-full border border-eg-border bg-eg-surface/75 p-1.5 backdrop-blur transition-opacity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            buscando ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
          style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.15)", scrollSnapType: "x mandatory" }}
          role="tablist"
          aria-label="Categorias de perfil"
        >
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 rounded-full bg-eg-accent transition-all duration-300 ease-out"
            style={{
              left: indicador.left,
              width: indicador.width,
              boxShadow: "0 8px 24px rgba(249,115,22,0.15)",
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
                style={{ scrollSnapAlign: "center", transform: ativa ? "scale(1.03)" : undefined }}
                className={`relative z-10 flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                  ativa
                    ? "text-eg-surface"
                    : "text-eg-ink-soft hover:bg-eg-accent-soft"
                }`}
              >
                {cat.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    ativa ? "bg-eg-surface/25 text-eg-surface" : "bg-eg-accent-soft text-eg-accent"
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
              style={selecionado ? { transform: "scale(1.02)" } : undefined}
              className={`group flex items-start gap-3 rounded-2xl border bg-eg-surface p-4 transition-all duration-200 hover:border-eg-accent hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] ${
                selecionado
                  ? "border-eg-accent shadow-[0_8px_24px_rgba(249,115,22,0.15)]"
                  : "border-eg-border"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-eg-accent-soft">
                <Icone className="h-5 w-5 text-eg-accent" />
              </span>
              <span className="min-w-0 flex-1">
                {buscando && (
                  <span className="mb-1 inline-block rounded-full bg-eg-accent-soft px-2 py-0.5 text-[9px] font-bold tracking-wider text-eg-accent">
                    {CATEGORIAS.find((c) => c.id === perfil.categoria)?.label}
                  </span>
                )}
                <span className="block text-sm font-bold text-eg-ink">{perfil.nome}</span>
                <span className="mt-0.5 block text-xs leading-snug text-eg-ink-soft">
                  {perfil.descricao}
                </span>
                <button
                  type="button"
                  onClick={() => onSelecionar(perfil)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-eg-accent px-3 py-1.5 text-xs font-bold text-eg-surface transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-eg-accent focus-visible:ring-offset-2"
                >
                  Entrar
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            </article>
          );
        })}
        {perfisVisiveis.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-eg-ink-soft">
            Nenhum perfil encontrado para “{busca}”.
          </p>
        )}
      </div>
    </section>
  );
}
