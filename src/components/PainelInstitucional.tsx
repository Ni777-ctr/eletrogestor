const TAGS = [
  "Programação de obras",
  "Viabilidade",
  "Pré-APR 45 dias",
  "Faturamento",
  "Materiais e kits",
  "Inventário",
  "Self-Healing",
  "Subestação Digital",
];

type Props = {
  /** percentual_restabelecimento_automatico vindo de GET /automacao/painel */
  percentualRestabelecimento: number | null;
  carregandoPainel: boolean;
};

export function PainelInstitucional({ percentualRestabelecimento, carregandoPainel }: Props) {
  const estatisticas = [
    { valor: "21", legenda: "perfis de acesso" },
    { valor: "10", legenda: "módulos operacionais" },
    { valor: "45d", legenda: "alerta de Pré-APR" },
    {
      valor:
        carregandoPainel || percentualRestabelecimento === null
          ? "—"
          : `${percentualRestabelecimento}%`,
      legenda: "restabelecimento automático",
    },

  ];

  return (
    <aside className="eg-panel-institucional flex flex-col justify-between gap-10 px-8 py-10 lg:px-14 lg:py-14">
      <div>
        <div className="flex items-center gap-3">
          <img
            src="/logo-eg.jpeg"
            alt="Logo EG"
            className="h-11 w-11 rounded-xl bg-white object-contain p-0.5"
            style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.15)" }}
          />
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight text-eg-ink">EletroGestor</p>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-eg-ink-soft">
              VERSÃO 2.0
            </p>
          </div>
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-eg-accent/30 bg-eg-surface/70 px-3 py-1.5 backdrop-blur">
          <span className="eg-pulse h-2 w-2 rounded-full bg-eg-accent" />
          <span className="text-xs font-medium text-eg-ink-soft">
            Operação conectada em tempo real
          </span>
        </div>

        <h1 className="mt-8 max-w-md text-4xl font-bold leading-[1.12] tracking-tight text-eg-ink lg:text-5xl">
          Toda a obra
          <br />
          de rede elétrica
          <br />
          em um só sistema.
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-eg-ink-soft">
          Programação, viabilidade, segurança, materiais, inventário e faturamento em um único
          fluxo — agora também com automação de rede, self-healing e subestações digitais
          monitoradas em tempo real.
        </p>

        <ul className="mt-7 flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-eg-accent/25 bg-eg-surface/50 px-3 py-1 text-[11px] font-medium text-eg-ink-soft"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {estatisticas.map((item) => (
            <div key={item.legenda}>
              <dt className="text-3xl font-bold tracking-tight text-eg-accent">{item.valor}</dt>
              <dd className="mt-1 text-[11px] leading-snug text-eg-ink-soft">{item.legenda}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-sm border-t border-eg-accent/20 pt-4 text-[11px] leading-relaxed text-eg-ink-soft">
          Acesso restrito a colaboradores autorizados. Todas as tentativas de acesso são
          registradas em log de auditoria.
        </p>
      </div>
    </aside>
  );
}
