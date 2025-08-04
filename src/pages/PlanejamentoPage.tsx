import { useCallback, useEffect, useState } from "react";
import {
  useOutlet,
  useNavigate,
  Outlet,
  useParams,
  useOutletContext,
} from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { viagemService, type Viagem } from "../services/viagemService";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { styled } from "styled-components";
import { CalendarioMensal } from "./Planejamento/components/CalendarioMensal";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { ModalGlobal } from "../components/ModalGlobal";
import {
  SearchNotFind,
  SearchText,
  SearchTextError,
} from "../components/ui/Layout";

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
  color: var(--color-title);
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);

  &:hover {
    background-color: var(--color-cardBackground);
  }
`;

const Select = styled.select`
  @media (max-width: 768px) {
    display: none;
  }
`;

interface OutletContext {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function PlanejamentoPage() {
  const { tripId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const isEditing = !!tripId;
  const { isLoggedIn } = useAuth();
  const { setIsModalOpen } = useOutletContext<OutletContext>();

  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("AGENDADA");
  const [termoBusca, setTermoBusca] = useState("");
  const [viewMode, setViewMode] = useState("lista");
  const [displayedMonth, setDisplayedMonth] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarViagens = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await viagemService.listar();

      const dadosOrdenados = data.sort((a, b) => {
        const dataInicioA = new Date(a.startDate || "");
        const dataInicioB = new Date(b.startDate || "");

        const timeA = dataInicioA.getTime();
        const timeB = dataInicioB.getTime();

        if (timeA !== timeB) {
          if (isNaN(timeA)) return 1;
          if (isNaN(timeB)) return -1;
          return timeA - timeB;
        }

        const dataFimA = new Date(a.endDate || "");
        const dataFimB = new Date(b.endDate || "");

        const timeFimA = dataFimA.getTime();
        const timeFimB = dataFimB.getTime();

        if (timeFimA !== timeFimB) {
          if (isNaN(timeFimA)) return 1;
          if (isNaN(timeFimB)) return -1;
          return timeFimA - timeFimB;
        }

        return (a.title || "").localeCompare(b.title || "");
      });

      setViagens(dadosOrdenados);
    } catch (err) {
      console.error("Erro capturado no frontend (PlanejamentoPage.tsx):", err);
      if (axios.isAxiosError(err)) {
        console.error("É um erro Axios. Resposta:", err.response);
        console.error("Erro Axios. Config:", err.config);
      }

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          setError("Acesso negado. Por favor, faça login novamente.");
        } else {
          setError(
            `Erro ao buscar viagens: ${err.response.status} - ${err.response.statusText}`
          );
        }
      } else if (err instanceof Error) {
        setError(`Erro ao buscar viagens: ${err.message}`);
      } else {
        setError("Erro desconhecido ao buscar viagens.");
      }
      console.error("Erro completo ao buscar viagens:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    carregarViagens();
  }, [carregarViagens]);

  useEffect(() => {
    setIsModalOpen(!!outlet);
    return () => setIsModalOpen(false);
  }, [outlet, setIsModalOpen]);

  const filtrosPlanejamento: Filtro[] = [
    { id: "AGENDADA", label: "Agendadas" },
    { id: "EM_CURSO", label: "Em Andamento" },
    { id: "FINALIZADA", label: "Finalizadas" },
    { id: "CANCELADA", label: "Canceladas" },
    { id: "TODAS", label: "Todas" },
  ];

  const viagensFiltradas = viagens.filter((viagem: Viagem) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let correspondeAoFiltro = false;
    if (filtroAtivo === "TODAS") {
      correspondeAoFiltro = true;
    } else {
      correspondeAoFiltro = viagem.status === filtroAtivo;
    }

    const correspondeABusca = viagem.title
      .toLowerCase()
      .includes(termoBusca.toLowerCase());

    return correspondeAoFiltro && correspondeABusca;
  });

  const handleSuccess = () => {
    carregarViagens();
    navigate("/");
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta viagem?")) {
      try {
        await viagemService.excluir(id);
        setViagens((viagensAtuais) => viagensAtuais.filter((v) => v.id !== id));
        alert("Viagem excluída com sucesso.");
        navigate("/");
      } catch (err) {
        let errorMessage = "Ocorreu um erro ao excluir a viagem.";
        if (axios.isAxiosError(err)) {
          if (err.response) {
            errorMessage =
              err.response.data.message ||
              `Erro do servidor: ${err.response.status}`;
          } else if (err.request) {
            errorMessage = "Erro de rede ao excluir a viagem.";
          }
        } else if (err instanceof Error) {
          errorMessage = `Erro: ${err.message}`;
        }
        alert(errorMessage);
        console.error("Erro completo ao excluir viagem:", err);
      }
    }
  };

  const viagemParaEditar = tripId
    ? viagens.find((v) => v.id === parseInt(tripId))
    : undefined;

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
          <Select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value);
              setTermoBusca("");
              setFiltroAtivo("AGENDADA");
            }}
            style={{
              padding: "0.5rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
            }}
          >
            <option value="lista">Visualizar Viagens</option>
            <option value="mes">Visualizar por Mês</option>
          </Select>

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
        {loading ? (
          <SearchText>Carregando viagens...</SearchText>
        ) : error ? (
          <SearchTextError style={{ color: "red" }}>{error}</SearchTextError>
        ) : viagensFiltradas.length === 0 && viewMode === "lista" ? (
          <SearchNotFind>
            Nenhuma viagem encontrada para este filtro ou busca.
          </SearchNotFind>
        ) : viewMode === "lista" ? (
          <ListaDeViagens viagens={viagensFiltradas} />
        ) : (
          <CalendarioMensal mesExibido={displayedMonth} viagens={viagens} />
        )}
      </ViewContainer>

      {outlet && (
        <ModalGlobal
          title={isEditing ? "Editar Viagem" : "Nova Viagem"}
          onClose={() => navigate("/")}
        >
          <Outlet
            context={{
              onSuccess: handleSuccess,
              onExcluirViagem: handleExcluir,
              viagem: viagemParaEditar,
            }}
          />
        </ModalGlobal>
      )}
    </div>
  );
}
