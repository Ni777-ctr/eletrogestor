const TAGS = [
  "Obras & Programação",
  "Segurança & Qualidade",
  "Suprimentos",
  "Faturamento & Medição",
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
          ? "24h"
          : `${percentualRestabelecimento}%`,
      legenda:
        carregandoPainel || percentualRestabelecimento === null
          ? "monitoramento contínuo"
          : "restabelecimento automático",
    },

  ];

  return (
    <aside className="eg-panel-institucional flex flex-col justify-between gap-10 border-b border-eg-border px-8 py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-14">
      <div>
        <div className="flex items-center gap-3">
          <img
            src="/logo-eg.jpeg"
            alt="Logo EG"
            className="h-12 w-12 rounded-lg border border-eg-border bg-eg-surface object-contain p-0.5"
          />
          <div className="leading-tight">
            <p className="text-xl font-semibold tracking-[-0.025em] text-eg-text [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
              EletroGestor
            </p>
          </div>
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-md border border-eg-border bg-eg-surface px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-eg-accent" />
          <span className="text-xs font-medium text-eg-muted">
            Operação conectada em tempo real
          </span>
        </div>

        <h1 className="mt-7 max-w-md text-[26px] font-semibold leading-[1.15] tracking-tight text-eg-text lg:text-[31px]">
          Toda a obra
          <br />
          de rede elétrica
          <br />
          em um só sistema.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-eg-muted">
          Programação, viabilidade, segurança, materiais, inventário e faturamento em um único
          fluxo — agora também com automação de rede, self-healing e subestações digitais
          monitoradas em tempo real.
        </p>

        <ul className="mt-7 flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-eg-border bg-eg-surface px-2.5 py-1 text-[11px] font-medium text-eg-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {estatisticas.map((item) => (
            <div key={item.legenda} className="rounded-lg border border-eg-border bg-eg-surface-raised p-3">
              <dt className="text-2xl font-semibold tracking-tight text-eg-text">{item.valor}</dt>
              <dd className="mt-1 text-[10px] leading-snug text-eg-muted">{item.legenda}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-sm border-t border-eg-border pt-4 text-[11px] leading-relaxed text-eg-muted">
          Acesso restrito a colaboradores autorizados. Todas as tentativas de acesso são
          registradas em log de auditoria.
        </p>
      </div>
    </aside>
  );
}
