import { useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { tripsData as initialTripsData } from "../data/tripsData";
import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { ModalGlobal } from "../components/ModalGlobal";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import type { Trip } from "../data/tripsData";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarioMensal } from "./Planejamento/components/CalendarioMensal";
import { styled } from "styled-components";

const ViewContainer = styled.div``;

const MonthNavigator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MonthDisplay = styled.h3`
  margin: 0;
  text-transform: capitalize;
  width: 200px;
  text-align: center;
  font-weight: 600;
  color: var(--cor-titulos);
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid var(--cor-bordas);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cor-secundaria);

  &:hover {
    background-color: var(--cor-de-fundo-cards);
  }
`;

export function PlanejamentoPage() {
  const { tripId } = useParams();

  const [viagens, setViagens] = useState<Trip[]>(initialTripsData);
  const [filtroAtivo, setFiltroAtivo] = useState("em_andamento");
  const [termoBusca, setTermoBusca] = useState("");

  const [viewMode, setViewMode] = useState("lista");
  const [displayedMonth, setDisplayedMonth] = useState(new Date());

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
    const viagemConflitante = verificarConflitos(dadosDoFormulario, null);

    if (viagemConflitante) {
      alert(
        `CONFLITO DE AGENDAMENTO!\n\nO veículo selecionado já está em uso no período para a reserva: "${viagemConflitante.title}".`
      );
      return;
    }

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
    const viagemConflitante = verificarConflitos(dadosAtualizados, id);

    if (viagemConflitante) {
      alert(
        `CONFLITO DE AGENDAMENTO!\n\nO veículo selecionado já está em uso no período para a reserva: "${viagemConflitante.title}".`
      );
      return;
    }

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

  const verificarConflitos = (
    dadosViagem: Omit<Trip, "id" | "status">,
    idSendoEditado: number | null
  ): Trip | null => {
    // Converte as datas e horas da nova viagem para objetos Date para comparação
    const inicioNovaViagem = new Date(
      `${dadosViagem.startDate}T${dadosViagem.startTime}`
    );
    const fimNovaViagem = new Date(
      `${dadosViagem.endDate}T${dadosViagem.endTime}`
    );

    for (const viagemExistente of viagens) {
      if (idSendoEditado && viagemExistente.id === idSendoEditado) {
        continue;
      }

      if (viagemExistente.vehicleId === dadosViagem.vehicleId) {
        const inicioExistente = new Date(
          `${viagemExistente.startDate}T${viagemExistente.startTime}`
        );
        const fimExistente = new Date(
          `${viagemExistente.endDate}T${viagemExistente.endTime}`
        );

        const haConflito =
          inicioNovaViagem < fimExistente && fimNovaViagem > inicioExistente;

        if (haConflito) {
          return viagemExistente;
        }
      }
    }

    return null;
  };

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => {
          setTermoBusca(e.target.value);
          setViewMode("lista");
        }}
        filtros={viewMode === "lista" ? filtrosPlanejamento : []}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      >
        <>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <option value="lista">Visualizar Viagens</option>
            <option value="mes">Visualizar por Mês</option>
          </select>

          {viewMode === "mes" && (
            <MonthNavigator>
              <NavButton
                onClick={() => setDisplayedMonth(subMonths(displayedMonth, 1))}
              >
                ‹
              </NavButton>
              <MonthDisplay>
                {format(displayedMonth, "MMMM yyyy", { locale: ptBR })}
              </MonthDisplay>
              <NavButton
                onClick={() => setDisplayedMonth(addMonths(displayedMonth, 1))}
              >
                ›
              </NavButton>
            </MonthNavigator>
          )}
        </>
      </FiltroGlobal>

      <ViewContainer>
        {viewMode === "lista" ? (
          <ListaDeViagens viagens={viagensFiltradas} />
        ) : (
          <CalendarioMensal mesExibido={displayedMonth} viagens={viagens} />
        )}
      </ViewContainer>

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
