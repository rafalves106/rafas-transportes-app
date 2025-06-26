import { useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { tripsData as initialTripsData } from "../data/tripsData";
import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { ModalGlobal } from "../components/ModalGlobal";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import type { Trip } from "../data/tripsData";

export function PlanejamentoPage() {
  const { tripId } = useParams();

  const [viagens, setViagens] = useState<Trip[]>(initialTripsData);
  const [filtroAtivo, setFiltroAtivo] = useState("em_andamento");
  const [termoBusca, setTermoBusca] = useState("");

  const outlet = useOutlet();
  const navigate = useNavigate();

  const filtrosPlanejamento: Filtro[] = [
    { id: "em_andamento", label: "Em Andamento" },
    { id: "proximas", label: "Próximas" },
    { id: "realizadas", label: "Realizadas" },
  ];

  const viagensFiltradas = viagens.filter((viagem: Trip) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataInicio = new Date(viagem.startDate + "T00:00");
    const dataFim = new Date(viagem.endDate + "T00:00");

    let correspondeAoFiltro = false;
    if (filtroAtivo === "em_andamento")
      correspondeAoFiltro = hoje >= dataInicio && hoje <= dataFim;
    if (filtroAtivo === "proximas") correspondeAoFiltro = dataInicio > hoje;
    if (filtroAtivo === "realizadas") correspondeAoFiltro = dataFim < hoje;

    const correspondeABusca = viagem.title
      .toLowerCase()
      .includes(termoBusca.toLowerCase());

    return correspondeAoFiltro && correspondeABusca;
  });

  const handleAdicionarViagem = (
    dadosDoFormulario: Omit<Trip, "id" | "status">
  ) => {
    const novaViagem = {
      id: Date.now(),
      status: "Agendada" as const,
      ...dadosDoFormulario,
    };
    setViagens((viagensAnteriores) => [novaViagem, ...viagensAnteriores]);
    navigate("/");
  };

  const handleEditarViagem = (
    id: number,
    dadosAtualizados: Omit<Trip, "id" | "status">
  ) => {
    setViagens((viagensAnteriores) =>
      viagensAnteriores.map((viagem) => {
        if (viagem.id === id) {
          return { ...viagem, ...dadosAtualizados };
        }
        return viagem;
      })
    );
    navigate("/");
  };

  const handleExcluirViagem = (id: number) => {
    setViagens((viagensAnteriores) =>
      viagensAnteriores.filter((viagem) => viagem.id !== id)
    );
    navigate("/");
  };

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtrosPlanejamento}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />

      <ListaDeViagens viagens={viagensFiltradas} />

      {outlet && (
        <ModalGlobal
          title={tripId ? "Editar Reserva" : "Adicionar Nova Viagem"}
          onClose={() => navigate("/")}
          formId={tripId ? `form-editar-viagem-${tripId}` : "form-nova-viagem"}
        >
          <Outlet
            context={{
              onAdicionarViagem: handleAdicionarViagem,
              onEditarViagem: handleEditarViagem,
              onExcluirViagem: handleExcluirViagem,
            }}
          />
        </ModalGlobal>
      )}
    </div>
  );
}
