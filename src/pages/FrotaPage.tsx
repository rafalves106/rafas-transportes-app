import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Outlet, useOutlet } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeVeiculos } from "./Frota/components/ListaDeVeiculos";
import type { Vehicle } from "../services/veiculoService";
import { veiculoService } from "../services/veiculoService";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";
import { ModalFooter } from "../components/ui/ModalFooter";

export function FrotaPage() {
  const [veiculos, setVeiculos] = useState<Vehicle[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Ativo");
  const [termoBusca, setTermoBusca] = useState("");

  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const outlet = useOutlet();

  const isEditing = !!vehicleId;
  const { isLoggedIn } = useAuth();

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

  const handleAdicionar = async (dados: Omit<Vehicle, "id">) => {
    try {
      await veiculoService.adicionar(dados);
      await fetchVeiculos();
      navigate("/frota");
      alert("Veículo cadastrado com sucesso!");
    } catch (err) {
      console.error("Falha ao adicionar veículo:", err);
      if (axios.isAxiosError(err) && err.response) {
        alert(
          `Erro ao adicionar: ${err.response.status} - ${err.response.statusText}`
        );
      } else if (err instanceof Error) {
        alert(`Erro ao adicionar: ${err.message}`);
      } else {
        alert("Erro desconhecido ao adicionar.");
      }
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
      if (axios.isAxiosError(err) && err.response) {
        alert(
          `Erro ao editar: ${err.response.status} - ${err.response.statusText}`
        );
      } else if (err instanceof Error) {
        alert(`Erro ao editar: ${err.message}`);
      } else {
        alert("Erro desconhecido ao editar.");
      }
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
        alert(
          `Erro ao excluir: ${err.response.status} - ${err.response.statusText}`
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
        <div>Carregando veículos...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : veiculosFiltrados.length === 0 ? (
        <p>Nenhum veículo encontrado para este filtro ou busca.</p>
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
          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/frota")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={
                isEditing
                  ? `form-editar-veiculo-${vehicleId}`
                  : "form-novo-veiculo"
              }
            >
              {isEditing ? "Salvar Alterações" : "Salvar Veículo"}
            </Button>
          </ModalFooter>
        </ModalGlobal>
      )}
    </div>
  );
}
