import { useCallback, useEffect, useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { ModalGlobal } from "../components/ModalGlobal";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { viagemService, type Viagem } from "../services/viagemService";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { styled } from "styled-components";
import { CalendarioMensal } from "./Planejamento/components/CalendarioMensal";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

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

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

export function PlanejamentoPage() {
  const { tripId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const isEditing = !!tripId;
  const { isLoggedIn } = useAuth();

  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("proximas");
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
      setViagens(data);
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

  const filtrosPlanejamento: Filtro[] = [
    { id: "proximas", label: "Próximas" },
    { id: "em_andamento", label: "Em Andamento" },
    { id: "realizadas", label: "Realizadas" },
  ];

  const viagensFiltradas = viagens.filter((viagem: Viagem) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataInicio = new Date(viagem.startDate + "T00:00:00");
    const dataFim = new Date(viagem.endDate + "T00:00:00");

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
        alert((err as Error).message);
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
        {loading ? (
          <div>Carregando viagens...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : viagensFiltradas.length === 0 ? (
          <p>Nenhuma viagem encontrada para este filtro ou busca.</p>
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
          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={
                isEditing ? `form-editar-viagem-${tripId}` : "form-nova-viagem"
              }
            >
              {isEditing ? "Salvar Alterações" : "Salvar Viagem"}
            </Button>
          </ModalFooter>
        </ModalGlobal>
      )}
    </div>
  );
}
