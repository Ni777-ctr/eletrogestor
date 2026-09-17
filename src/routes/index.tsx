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

  const painel = useQuery({
    queryKey: ["automacao", "painel"],
    queryFn: getPainelAutomacao,
    enabled: API_URL.length > 0,
    retry: false,
  });

  function selecionar(p: Perfil) {
    setPerfil(p);
  }

  if (perfil?.id === "gerencia-geral") {
    return <GerenciaGeralDashboard onVoltar={() => setPerfil(null)} />;
  }

  if (perfil?.id === "administrativo") {
    return <AdministrativoDashboard onVoltar={() => setPerfil(null)} perfil="Administrativo" />;
  }

  if (perfil?.id === "administrador") {
    return <AdministradorDashboard onVoltar={() => setPerfil(null)} />;
  }

  if (perfil?.id === "faturamento-medicao") {
    return <FaturamentoDashboard onVoltar={() => setPerfil(null)} />;
  }

  if (perfil?.id === "programacao") {
    return <ProgramacaoDashboard onVoltar={() => setPerfil(null)} />;
  }

  if (perfil) {
    return <PerfilDashboard perfil={perfil} onVoltar={() => setPerfil(null)} />;
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
