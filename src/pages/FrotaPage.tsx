import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet, useOutlet } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeVeiculos } from "./Frota/components/ListaDeVeiculos";
import type { Vehicle } from "../services/veiculoService";
import { veiculoService } from "../services/veiculoService";
import { Button } from "../components/ui/Button";
import { styled } from "styled-components";

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
`;

export function FrotaPage() {
  const [veiculos, setVeiculos] = useState<Vehicle[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Ativo");
  const [termoBusca, setTermoBusca] = useState("");

  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const outlet = useOutlet();

  const isEditing = !!vehicleId;

  const fetchVeiculos = async () => {
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
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const handleAdicionar = async (dados: Omit<Vehicle, "id">) => {
    try {
      await veiculoService.adicionar(dados);
      await fetchVeiculos();
      navigate("/frota");
      alert("Veículo cadastrado com sucesso!");
    } catch (error) {
      alert((error as Error).message);
      console.error(error);
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      alert((error as Error).message);
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
      <ListaDeVeiculos veiculos={veiculosFiltrados} />
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
