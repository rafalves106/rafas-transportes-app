import { useCallback, useEffect, useState } from "react";
import {
  useOutlet,
  useNavigate,
  Outlet,
  useParams,
  useOutletContext,
} from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeMotoristas } from "./Motorista/components/ListaDeMotoristas";
import type { Driver } from "../services/motoristaService";
import type { Viagem } from "../services/viagemService";
import { motoristaService } from "../services/motoristaService";
import { viagemService } from "../services/viagemService";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";
import {
  SearchNotFind,
  SearchText,
  SearchTextError,
} from "../components/ui/Layout";

import { ModalCadastroFerias } from "./Motorista/components/ModalCadastroFerias";

interface OutletContext {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function MotoristaPage() {
  const [motoristas, setMotoristas] = useState<Driver[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Em Serviço");
  const [termoBusca, setTermoBusca] = useState("");

  const { driverId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();
  const { setIsModalOpen } = useOutletContext<OutletContext>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFeriasModalOpen, setIsFeriasModalOpen] = useState(false);
  const [motoristaParaFerias, setMotoristaParaFerias] = useState<Driver | null>(
    null
  );

  const carregarDados = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [motoristasData, viagensData] = await Promise.all([
        motoristaService.listar(),
        viagemService.listar(),
      ]);
      setMotoristas(motoristasData);
      console.log("Motoristas carregados:", motoristasData);
      setViagens(viagensData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError: AxiosError = err;
        if (axiosError.response) {
          if (axiosError.response.status === 403) {
            setError("Acesso negado. Por favor, faça login novamente.");
          } else {
            setError(
              `Erro ao buscar dados: ${axiosError.response.status} - ${axiosError.response.statusText}`
            );
          }
        } else {
          setError(`Erro de rede ou requisição: ${axiosError.message}`);
        }
      } else if (err instanceof Error) {
        setError(`Erro ao buscar dados: ${err.message}`);
      } else {
        setError("Erro desconhecido ao buscar dados.");
      }
      console.error("Erro completo ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    setIsModalOpen(!!outlet || isFeriasModalOpen);
    return () => setIsModalOpen(false);
  }, [outlet, isFeriasModalOpen, setIsModalOpen]);

  const filtros: Filtro[] = [
    { id: "Em Serviço", label: "Em Serviço" },
    { id: "Ativo", label: "Ativos" },
    { id: "Inativo", label: "Inativos" },
    { id: "Férias", label: "Férias" },
  ];

  const motoristasFiltrados = motoristas
    .filter((motorista) => {
      if (filtroAtivo === "Em Serviço") {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const estaEmServico = viagens.some((trip) => {
          const dataInicio = new Date(trip.startDate + "T00:00");
          const dataFim = new Date(trip.endDate + "T00:00");
          return (
            trip.motoristaNome === motorista.nome &&
            hoje >= dataInicio &&
            hoje <= dataFim
          );
        });
        return estaEmServico;
      }

      switch (filtroAtivo) {
        case "Ativo":
          return motorista.status === "ATIVO";
        case "Inativo":
          return motorista.status === "INATIVO";
        case "Férias":
          return motorista.status === "DE_FERIAS";
        default:
          return false;
      }
    })
    .filter((d) => d.nome.toLowerCase().includes(termoBusca.toLowerCase()));

  const handleSuccess = (motoristaAtualizado?: Driver) => {
    if (motoristaAtualizado) {
      setMotoristas((prev) =>
        prev.map((m) =>
          m.id === motoristaAtualizado.id ? motoristaAtualizado : m
        )
      );
    } else {
      carregarDados();
    }

    navigate("/motoristas");
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      try {
        await motoristaService.excluir(id);

        setMotoristas((motoristasAtuais) =>
          motoristasAtuais.filter((m) => m.id !== id)
        );

        navigate("/motoristas");
        alert("Motorista excluído com sucesso.");
      } catch (err) {
        console.error("Erro ao excluir motorista", err);
        if (axios.isAxiosError(err) && err.response) {
          alert(
            `Erro ao excluir: ${err.response.status} - ${err.response.statusText}`
          );
        } else if (err instanceof Error) {
          alert(`Erro ao excluir: ${err.message}`);
        } else {
          alert("Erro desconhecido ao excluir.");
        }
      }
    }
  };

  const handleOpenFeriasModal = (motorista: Driver) => {
    setMotoristaParaFerias(motorista);
    setIsFeriasModalOpen(true);
    setIsModalOpen(true); // Notifica o App.tsx que o modal de férias está aberto
  };

  const handleCloseFeriasModal = () => {
    setIsFeriasModalOpen(false);
    setMotoristaParaFerias(null);
    setIsModalOpen(false); // Notifica o App.tsx que o modal de férias está fechado
  };

  const handleFeriasSuccess = () => {
    carregarDados();
    handleCloseFeriasModal();
  };

  const motoristaParaEditar = driverId
    ? motoristas.find((d) => d.id === parseInt(driverId))
    : undefined;
  console.log("Motorista passado para o Outlet:", motoristaParaEditar);

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtros}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />
      {loading ? (
        <SearchText>Carregando motoristas...</SearchText>
      ) : error ? (
        <SearchTextError style={{ color: "red" }}>{error}</SearchTextError>
      ) : motoristasFiltrados.length === 0 ? (
        <SearchNotFind>
          Nenhum motorista encontrado para este filtro ou busca.
        </SearchNotFind>
      ) : (
        <ListaDeMotoristas motoristas={motoristasFiltrados} viagens={viagens} />
      )}

      {outlet && (
        <ModalGlobal
          title={driverId ? "Editar Motorista" : "Novo Motorista"}
          onClose={() => navigate("/motoristas")}
        >
          <Outlet
            key={driverId || "novo"}
            context={{
              onSuccess: handleSuccess,
              onExcluir: handleExcluir,
              motorista: motoristaParaEditar,
              onOpenFeriasModal: handleOpenFeriasModal,
            }}
          />
        </ModalGlobal>
      )}

      {isFeriasModalOpen && motoristaParaFerias && (
        <ModalCadastroFerias
          isOpen={isFeriasModalOpen}
          onClose={handleCloseFeriasModal}
          motoristaId={motoristaParaFerias.id}
          onSuccess={handleFeriasSuccess}
        />
      )}
    </div>
  );
}
