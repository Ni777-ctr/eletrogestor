import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PainelInstitucional } from "@/components/PainelInstitucional";
import { SelecaoPerfil } from "@/components/SelecaoPerfil";
import { GerenciaGeralDashboard } from "@/components/GerenciaGeralDashboard";
import { AdministrativoDashboard } from "@/components/AdministrativoDashboard";
import { AdministradorDashboard } from "@/components/AdministradorDashboard";
import { FaturamentoDashboard } from "@/components/FaturamentoDashboard";
import { PerfilDashboard } from "@/components/PerfilDashboard";
import { ProgramacaoDashboard } from "@/components/ProgramacaoDashboard";
import { SuprimentosDashboard } from "@/components/SuprimentosDashboard";
import { LoginPerfil } from "@/components/LoginPerfil";
import { API_URL, encerrarSessao, getPainelAutomacao } from "@/lib/api";
import type { Perfil } from "@/data/perfis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EletroGestor — Seleção de perfil de acesso" },
      {
        name: "description",
        content:
          "Sistema de gestão para obras e serviços de rede elétrica.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [autenticado, setAutenticado] = useState(false);

  const painel = useQuery({
    queryKey: ["automacao", "painel"],
    queryFn: getPainelAutomacao,
    enabled: API_URL.length > 0 && autenticado,
    retry: false,
  });

  function selecionar(p: Perfil) {
    setAutenticado(false);
    setPerfil(p);
  }

  function sair() {
    encerrarSessao();
    setAutenticado(false);
    setPerfil(null);
  }

  if (perfil && !autenticado) {
    return <LoginPerfil perfil={perfil} onAutenticado={() => setAutenticado(true)} onVoltar={sair} />;
  }

  if (perfil?.id === "gerencia-geral") {
    return <GerenciaGeralDashboard onVoltar={sair} />;
  }

  if (perfil?.id === "administrativo") {
    return <AdministrativoDashboard onVoltar={sair} perfil="Administrativo" />;
  }

  if (perfil?.id === "administrador") {
    return <AdministradorDashboard onVoltar={sair} />;
  }

  if (perfil?.id === "faturamento-medicao") {
    return <FaturamentoDashboard onVoltar={sair} />;
  }

  if (perfil?.id === "programacao") {
    return <ProgramacaoDashboard onVoltar={sair} />;
  }

  if (perfil?.id === "suprimentos-compras") {
    return <SuprimentosDashboard onVoltar={sair} />;
  }

  if (perfil) {
    return <PerfilDashboard perfil={perfil} onVoltar={sair} />;
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <PainelInstitucional
        percentualRestabelecimento={
          painel.data?.percentual_restabelecimento_automatico ?? null
        }
        carregandoPainel={painel.isLoading}
      />

      <SelecaoPerfil
        onSelecionar={selecionar}
        perfilSelecionadoId={perfil?.id ?? null}
      />
    </main>
  );
}
