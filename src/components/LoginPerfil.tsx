import { useState } from "react";
import { ArrowLeft, KeyRound, LoaderCircle, LogIn, UserRound } from "lucide-react";
import type { Perfil } from "@/data/perfis";
import { encerrarSessao, fazerLogin } from "@/lib/api";

type Props = {
  perfil: Perfil;
  onAutenticado: () => void;
  onVoltar: () => void;
};

export function LoginPerfil({ perfil, onAutenticado, onVoltar }: Props) {
  const [usuario, setUsuario] = useState(`teste.${perfil.id}`);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const sessao = await fazerLogin(usuario.trim(), senha);
      if (sessao.usuario.perfil_id !== perfil.id) {
        encerrarSessao();
        throw new Error(`Este usuário pertence ao perfil ${sessao.usuario.perfil_id}, não ao perfil selecionado.`);
      }
      onAutenticado();
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111214] px-5 py-8 text-[#f5f5f4] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-lg border border-[#303238] bg-[#1a1b1f] p-6 shadow-sm sm:p-8">
          <button
            type="button"
            onClick={onVoltar}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#b8bbc2] transition-colors hover:text-[#f5f5f4]"
          >
            <ArrowLeft size={16} /> Voltar aos perfis
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">Acesso ao sistema</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{perfil.nome}</h1>
          <p className="mt-2 text-sm leading-6 text-[#b8bbc2]">Entre com suas credenciais para acessar este módulo.</p>

          <form onSubmit={entrar} className="mt-7 space-y-4">
            <label className="block text-sm font-medium text-[#e5e7eb]">
              Usuário
              <span className="relative mt-2 block">
                <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
                <input
                  value={usuario}
                  onChange={(evento) => setUsuario(evento.target.value)}
                  autoComplete="username"
                  required
                  className="h-11 w-full rounded-md border border-[#363941] bg-[#141518] pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-[#777c86] focus:border-amber-500"
                />
              </span>
            </label>

            <label className="block text-sm font-medium text-[#e5e7eb]">
              Senha
              <span className="relative mt-2 block">
                <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
                <input
                  type="password"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-md border border-[#363941] bg-[#141518] pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-[#777c86] focus:border-amber-500"
                />
              </span>
            </label>

            {erro && <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-semibold text-[#16110a] transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? <LoaderCircle size={17} className="animate-spin" /> : <LogIn size={17} />}
              {enviando ? "Validando acesso..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
