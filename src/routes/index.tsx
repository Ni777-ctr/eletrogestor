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
import { LoginPerfil } from "@/components/LoginPerfil";
import { API_URL, getPainelAutomacao } from "@/lib/api";
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
    enabled: API_URL.length > 0,
    retry: false,
  });

  function selecionar(p: Perfil) {
    setPerfil(p);
    setAutenticado(false);
  }

  function voltarParaSelecao() {
    setPerfil(null);
    setAutenticado(false);
  }

  if (perfil && !autenticado) {
    return (
      <LoginPerfil
        perfil={perfil}
        onVoltar={voltarParaSelecao}
        onEntrar={() => setAutenticado(true)}
      />
    );
  }

  if (perfil?.id === "gerencia-geral") {
    return <GerenciaGeralDashboard onVoltar={voltarParaSelecao} />;
  }

  if (perfil?.id === "administrativo") {
    return <AdministrativoDashboard onVoltar={voltarParaSelecao} perfil="Administrativo" />;
  }

  if (perfil?.id === "administrador") {
    return <AdministradorDashboard onVoltar={voltarParaSelecao} />;
  }

  if (perfil?.id === "faturamento-medicao") {
    return <FaturamentoDashboard onVoltar={voltarParaSelecao} />;
  }

  if (perfil?.id === "programacao") {
    return <ProgramacaoDashboard onVoltar={voltarParaSelecao} />;
  }

  if (perfil) {
    return <PerfilDashboard perfil={perfil} onVoltar={voltarParaSelecao} />;
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
