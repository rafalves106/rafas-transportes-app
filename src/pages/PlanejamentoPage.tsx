import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { useState } from "react";
import { tripsData, type Trip } from "../data/TripsData";

import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";

export function PlanejamentoPage() {
  const [filtroAtivo, setFiltroAtivo] = useState("em_andamento");
  const [termoBusca, setTermoBusca] = useState("");

  const filtrosPlanejamento: Filtro[] = [
    { id: "em_andamento", label: "Em Andamento" },
    { id: "proximas", label: "Próximas" },
    { id: "realizadas", label: "Realizadas" },
  ];

  const viagensFiltradas = tripsData.filter((viagem: Trip) => {
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

  return (
    <div>
      <h1>Planejamento de Viagens</h1>

      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtrosPlanejamento}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />

      <ListaDeViagens viagens={viagensFiltradas} />
    </div>
  );
}
