import { useCallback, useEffect, useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeViagens } from "./Planejamento/components/ListaDeViagens";
import { viagemService, type Viagem } from "../services/viagemService";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { styled } from "styled-components";
import { CalendarioMensal } from "./Planejamento/components/CalendarioMensal";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { ModalFooter } from "../components/ui/ModalFooter";

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
  const outlet = useOutlet();
  const navigate = useNavigate();
  const isEditing = !!tripId;
  const { isLoggedIn } = useAuth();

  const [viagens, setViagens] = useState<Viagem[]>([]);
  // Filtro padrão para "Próximas" (assumindo que "Próximas" é um status ou lógica de filtro)
  // No seu backend, os status são AGENDADA, EM_CURSO, FINALIZADA, CANCELADA.
  // Vamos ajustar os filtros para refletir isso e adicionar um filtro "Todas" se desejar.
  const [filtroAtivo, setFiltroAtivo] = useState("AGENDADA"); // Novo padrão alinhado ao enum
  const [termoBusca, setTermoBusca] = useState("");
  const [viewMode, setViewMode] = useState("lista"); // 'lista' ou 'mes'
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

      // Ordena as viagens para exibição (útil para listas e calendário)
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
  }, [isLoggedIn]); // `isLoggedIn` como dependência para recarregar quando o status de login mudar

  useEffect(() => {
    carregarViagens();
  }, [carregarViagens]); // `carregarViagens` como dependência do `useEffect`

  // Definição dos filtros de status da viagem (IDs devem corresponder aos ENUMS do backend)
  const filtrosPlanejamento: Filtro[] = [
    { id: "AGENDADA", label: "Agendadas" },
    { id: "EM_CURSO", label: "Em Andamento" },
    { id: "FINALIZADA", label: "Finalizadas" },
    { id: "CANCELADA", label: "Canceladas" },
    { id: "TODAS", label: "Todas" }, // Adiciona uma opção para ver todas as viagens
  ];

  // Lógica de filtragem das viagens
  const viagensFiltradas = viagens.filter((viagem: Viagem) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data

    let correspondeAoFiltro = false;
    // Lógica para filtrar por status do enum
    if (filtroAtivo === "TODAS") {
      correspondeAoFiltro = true; // Se o filtro for 'Todas', todas as viagens correspondem
    } else {
      correspondeAoFiltro = viagem.status === filtroAtivo;
    }

    // Para o seu código atual com IDs "AGENDADA", "EM_CURSO", etc., a lógica é mais simples:
    const correspondeABusca = viagem.title
      .toLowerCase()
      .includes(termoBusca.toLowerCase());

    return correspondeAoFiltro && correspondeABusca;
  });

  const handleSuccess = () => {
    carregarViagens(); // Recarrega a lista após sucesso
    navigate("/"); // Volta para a página principal de planejamento
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta viagem?")) {
      try {
        await viagemService.excluir(id);
        // Atualiza o estado para remover a viagem excluída sem recarregar tudo
        setViagens((viagensAtuais) => viagensAtuais.filter((v) => v.id !== id));
        alert("Viagem excluída com sucesso.");
        navigate("/"); // Volta para a página principal
      } catch (err) {
        // Tratamento de erro detalhado para exclusão
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

  // Encontra a viagem para editar se o tripId estiver na URL
  const viagemParaEditar = tripId
    ? viagens.find((v) => v.id === parseInt(tripId))
    : undefined;

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => {
          setTermoBusca(e.target.value);
          setViewMode("lista"); // Volta para a visualização em lista ao pesquisar
        }}
        // Os filtros de status só aparecem no modo lista
        filtros={viewMode === "lista" ? filtrosPlanejamento : []}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      >
        {/* Dropdown para alternar entre visualização em lista e calendário */}
        <>
          <select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value);
              // Quando muda para calendário, resetar busca e filtro de status, se desejar
              setTermoBusca("");
              setFiltroAtivo("AGENDADA");
            }}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <option value="lista">Visualizar Viagens</option>
            <option value="mes">Visualizar por Mês</option>
          </select>

          {/* Navegador de meses no modo calendário */}
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
        ) : viagensFiltradas.length === 0 && viewMode === "lista" ? (
          <p>Nenhuma viagem encontrada para este filtro ou busca.</p>
        ) : viewMode === "lista" ? (
          <ListaDeViagens viagens={viagensFiltradas} />
        ) : (
          // No modo calendário, as viagens passadas são todas, não apenas as filtradas por status/busca
          // Isso porque o calendário exibe todos os eventos do mês, e o filtro de busca não se aplica diretamente
          <CalendarioMensal mesExibido={displayedMonth} viagens={viagens} />
        )}
      </ViewContainer>

      {/* Modal de Nova/Editar Viagem */}
      {outlet && (
        <ModalGlobal
          title={isEditing ? "Editar Viagem" : "Nova Viagem"}
          onClose={() => navigate("/")}
        >
          {/* O Outlet renderiza o FormularioNovaViagem aqui */}
          <Outlet
            context={{
              onSuccess: handleSuccess,
              onExcluirViagem: handleExcluir,
              viagem: viagemParaEditar,
            }}
          />
          {/* Footer do Modal com botões de Ação */}
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
