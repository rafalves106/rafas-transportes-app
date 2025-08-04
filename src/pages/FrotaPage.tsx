import { useEffect, useState, useCallback } from "react";
import {
  useNavigate,
  useParams,
  Outlet,
  useOutlet,
  useOutletContext,
} from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeVeiculos } from "./Frota/components/ListaDeVeiculos";
import type { Vehicle } from "../services/veiculoService";
import { veiculoService } from "../services/veiculoService";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";

import {
  SearchNotFind,
  SearchText,
  SearchTextError,
} from "../components/ui/Layout";

interface OutletContext {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function FrotaPage() {
  const [veiculos, setVeiculos] = useState<Vehicle[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Ativo");
  const [termoBusca, setTermoBusca] = useState("");

  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const outlet = useOutlet();

  const { isLoggedIn } = useAuth();
  const { setIsModalOpen } = useOutletContext<OutletContext>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVeiculos = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await veiculoService.listar();

      const getStatusFromApi = (status: string) => {
        if (status === "EM_MANUTENCAO") return "Em Manutenção";
        if (status === "INATIVO") return "Inativo";
        return "Ativo";
      };

      const dadosFormatados = data.map((veiculo) => ({
        ...veiculo,
        status: getStatusFromApi(veiculo.status) as
          | "Ativo"
          | "Inativo"
          | "Em Manutenção",
      }));

      setVeiculos(dadosFormatados);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError: AxiosError = err;
        if (axiosError.response) {
          if (axiosError.response.status === 403) {
            setError("Acesso negado. Por favor, faça login novamente.");
          } else {
            setError(
              `Erro ao buscar veículos: ${axiosError.response.status} - ${axiosError.response.statusText}`
            );
          }
        } else {
          setError(`Erro de rede ou requisição: ${axiosError.message}`);
        }
      } else if (err instanceof Error) {
        setError(`Erro ao buscar veículos: ${err.message}`);
      } else {
        setError("Erro desconhecido ao buscar veículos.");
      }
      console.error("Erro completo ao buscar veículos:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchVeiculos();
  }, [isLoggedIn, fetchVeiculos]);

  // Effect para notificar o pai sobre o estado do modal
  useEffect(() => {
    setIsModalOpen(!!outlet); // Se 'outlet' existe, o modal está aberto
    return () => setIsModalOpen(false); // Garante que o estado seja resetado ao desmontar
  }, [outlet, setIsModalOpen]);

  const handleAdicionar = async (dados: Omit<Vehicle, "id">) => {
    try {
      await veiculoService.adicionar(dados);
      await fetchVeiculos();
      navigate("/frota");
    } catch (err) {
      console.error("Falha ao adicionar veículo:", err);
      throw err;
    }
  };

  const handleEditar = async (id: number, dados: Omit<Vehicle, "id">) => {
    try {
      const getStatusForApi = (status: string) => {
        if (status === "Em Manutenção") return "EM_MANUTENCAO";
        if (status === "Inativo") return "INATIVO";
        return "ATIVO";
      };

      await veiculoService.editar(id, {
        ...dados,
        status: getStatusForApi(dados.status),
      });

      await fetchVeiculos();
      navigate("/frota");
    } catch (err) {
      console.error("Falha ao editar veículo:", err);
      throw err;
    }
  };

  const handleExcluir = async (id: number) => {
    try {
      await veiculoService.excluir(id);
      setVeiculos((veiculosAtuais) =>
        veiculosAtuais.filter((v) => v.id !== id)
      );
      alert("Veículo excluído com sucesso.");
      navigate("/frota");
    } catch (err) {
      console.error("Falha ao excluir veículo:", err);
      if (axios.isAxiosError(err) && err.response) {
        const backendErrorMessage = (err.response.data as { message?: string })
          ?.message;

        alert(
          `Erro ao excluir: ${err.response.status} - ${
            backendErrorMessage || err.response.statusText
          }`
        );
      } else if (err instanceof Error) {
        alert(`Erro ao excluir: ${err.message}`);
      } else {
        alert("Erro desconhecido ao excluir.");
      }
    }
  };

  const filtrosFrota: Filtro[] = [
    { id: "Ativo", label: "Ativos" },
    { id: "Inativo", label: "Inativos" },
    { id: "Em Manutenção", label: "Em Manutenção" },
  ];

  const veiculosFiltrados = veiculos
    .filter((v) => v.status.toLowerCase() === filtroAtivo.toLowerCase())
    .filter(
      (v) =>
        v.model.toLowerCase().includes(termoBusca.toLowerCase()) ||
        v.plate.toLowerCase().includes(termoBusca.toLowerCase())
    );

  const veiculoParaEditar = vehicleId
    ? veiculos.find((v) => v.id === parseInt(vehicleId))
    : undefined;

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtrosFrota}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />
      {loading ? (
        <SearchText>Carregando veículos...</SearchText>
      ) : error ? (
        <SearchTextError style={{ color: "red" }}>{error}</SearchTextError>
      ) : veiculosFiltrados.length === 0 ? (
        <SearchNotFind>
          Nenhum veículo encontrado para este filtro ou busca.
        </SearchNotFind>
      ) : (
        <ListaDeVeiculos veiculos={veiculosFiltrados} />
      )}

      {outlet && (
        <ModalGlobal
          title={vehicleId ? "Editar Veículo" : "Novo Veículo"}
          onClose={() => navigate("/frota")}
        >
          <Outlet
            context={{
              onAdicionar: handleAdicionar,
              onEditar: handleEditar,
              onExcluir: handleExcluir,
              veiculo: veiculoParaEditar,
            }}
          />
        </ModalGlobal>
      )}
    </div>
  );
}
