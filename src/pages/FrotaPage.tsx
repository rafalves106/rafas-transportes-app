import { useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { vehiclesData as initialVehiclesData } from "../data/vehiclesData";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeVeiculos } from "./Frota/components/ListaDeVeiculos";
import type { Vehicle } from "../data/vehiclesData";

export function FrotaPage() {
  const [veiculos, setVeiculos] = useState(initialVehiclesData);
  const [filtroAtivo, setFiltroAtivo] = useState("Ativo");
  const [termoBusca, setTermoBusca] = useState("");

  const filtrosFrota: Filtro[] = [
    { id: "Ativo", label: "Ativos" },
    { id: "Inativo", label: "Inativos" },
    { id: "Em Manutenção", label: "Em Manutenção" },
  ];

  const veiculosFiltrados = veiculos
    .filter((v) => v.status === filtroAtivo)
    .filter(
      (v) =>
        v.model.toLowerCase().includes(termoBusca.toLowerCase()) ||
        v.plate.toLowerCase().includes(termoBusca.toLowerCase())
    );

  const { vehicleId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const handleAdicionar = (dados: Omit<Vehicle, "id">) => {
    const placaExistente = veiculos.some(
      (veiculo) => veiculo.plate.toLowerCase() === dados.plate.toLowerCase()
    );

    if (placaExistente) {
      alert(`Erro: A placa "${dados.plate}" já está cadastrada no sistema.`);
      return;
    }

    const novoVeiculo = { id: Date.now(), ...dados };
    setVeiculos((prev) => [novoVeiculo, ...prev]);
    navigate("/frota");
  };

  const handleEditar = (id: number, dadosAtualizados: Omit<Vehicle, "id">) => {
    const placaExistente = veiculos.some(
      (veiculo) =>
        veiculo.id !== id &&
        veiculo.plate.toLowerCase() === dadosAtualizados.plate.toLowerCase()
    );

    if (placaExistente) {
      alert(
        `Erro: A placa "${dadosAtualizados.plate}" já pertence a outro veículo.`
      );
      return;
    }

    setVeiculos((prev) =>
      prev.map((veiculo) =>
        veiculo.id === id ? { ...veiculo, ...dadosAtualizados } : veiculo
      )
    );
    navigate("/frota");
  };

  const handleExcluir = (id: number) => {
    setVeiculos((prev) => prev.filter((veiculo) => veiculo.id !== id));
    navigate("/frota");
  };

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
          formId={
            vehicleId ? `form-editar-veiculo-${vehicleId}` : "form-novo-veiculo"
          }
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
