import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react";
import type { Perfil } from "@/data/perfis";

type Props = {
  perfil: Perfil;
  onVoltar: () => void;
  onEntrar: () => void;
};

export function LoginPerfil({ perfil, onVoltar, onEntrar }: Props) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const Icone = perfil.icone;

  return (
    <section className="flex min-h-screen flex-col justify-center bg-eg-surface px-6 py-10 lg:px-12 lg:py-14">
      <div className="eg-fade-in mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-eg-ink-soft transition-colors hover:bg-eg-accent-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          Trocar perfil
        </button>

        <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-eg-accent">
          PASSO 2 DE 2
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-eg-ink">Acessar o sistema</h2>

        <div
          className="mt-5 flex items-center gap-3 rounded-2xl border border-eg-accent bg-eg-surface p-4"
          style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.15)" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-eg-accent-soft">
            <Icone className="h-5 w-5 text-eg-accent" />
          </span>
          <span>
            <span className="block text-sm font-bold text-eg-ink">{perfil.nome}</span>
            <span className="block text-xs text-eg-ink-soft">{perfil.descricao}</span>
          </span>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onEntrar();
          }}
        >
          <div>
            <label htmlFor="usuario" className="text-xs font-semibold text-eg-ink">
              Usuário
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-eg-ink-soft" />
              <input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-full border border-eg-border bg-eg-surface py-3 pl-11 pr-4 text-sm text-eg-ink outline-none transition-colors placeholder:text-eg-ink-soft/70 focus:border-eg-accent"
                placeholder="seu.usuario"
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="text-xs font-semibold text-eg-ink">
              Senha
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-eg-ink-soft" />
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-full border border-eg-border bg-eg-surface py-3 pl-11 pr-11 text-sm text-eg-ink outline-none transition-colors placeholder:text-eg-ink-soft/70 focus:border-eg-accent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-eg-ink-soft transition-colors hover:bg-eg-accent-soft"
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-eg-accent py-3 text-sm font-bold text-eg-surface transition-transform hover:scale-[1.01]"
            style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.15)" }}
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-[11px] leading-relaxed text-eg-ink-soft">
          Acesso restrito a colaboradores autorizados. Todas as tentativas de acesso são
          registradas em log de auditoria.
        </p>
      </div>
    </section>
  );
}
