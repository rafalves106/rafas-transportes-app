import { useCallback, useEffect, useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeMotoristas } from "./Motorista/components/ListaDeMotoristas";
import type { Driver } from "../services/motoristaService";
import type { Viagem } from "../services/viagemService";
import { motoristaService } from "../services/motoristaService";
import { viagemService } from "../services/viagemService";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";
import { ModalFooter } from "../components/ui/ModalFooter";

export function MotoristaPage() {
  const [motoristas, setMotoristas] = useState<Driver[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Em Serviço");
  const [termoBusca, setTermoBusca] = useState("");

  const { driverId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const isEditing = !!driverId;
  const { isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    .filter(
      (d) =>
        d.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        d.cnh.toLowerCase().includes(termoBusca.toLowerCase())
    );

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
        <div>Carregando motoristas...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : motoristasFiltrados.length === 0 ? (
        <p>Nenhum motorista encontrado para este filtro ou busca.</p>
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
            }}
          />
          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/motoristas")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={
                isEditing
                  ? `form-editar-motorista-${driverId}`
                  : "form-novo-motorista"
              }
            >
              {isEditing ? "Salvar Alterações" : "Salvar Motorista"}
            </Button>
          </ModalFooter>
        </ModalGlobal>
      )}
    </div>
  );
}
