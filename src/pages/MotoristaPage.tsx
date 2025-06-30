import { useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { driversData as initialData } from "../data/driversData";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeMotoristas } from "./Motorista/components/ListaDeMotoristas";
import type { Driver } from "../data/driversData";
import { tripsData } from "../data/tripsData";

export function MotoristaPage() {
  const [motoristas, setMotoristas] = useState<Driver[]>(initialData);
  const [filtroAtivo, setFiltroAtivo] = useState("Em Serviço");
  const [termoBusca, setTermoBusca] = useState("");

  const { driverId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

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

        const estaEmServico = tripsData.some((trip) => {
          const dataInicio = new Date(trip.startDate + "T00:00");
          const dataFim = new Date(trip.endDate + "T00:00");
          return (
            trip.driverId === motorista.id &&
            hoje >= dataInicio &&
            hoje <= dataFim
          );
        });

        return estaEmServico;
      }

      return motorista.status === filtroAtivo;
    })
    .filter(
      (d) =>
        d.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(termoBusca.toLowerCase())
    );

  const handleAdicionar = (dados: Omit<Driver, "id">) => {
    const novoMotorista = { id: Date.now(), ...dados };
    setMotoristas((prev) => [novoMotorista, ...prev]);
    navigate("/motoristas");
  };

  const handleEditar = (id: number, dadosAtualizados: Omit<Driver, "id">) => {
    setMotoristas((prev) =>
      prev.map((motorista) =>
        motorista.id === id ? { ...motorista, ...dadosAtualizados } : motorista
      )
    );
    navigate("/motoristas");
  };

  const handleExcluir = (id: number) => {
    setMotoristas((prev) => prev.filter((motorista) => motorista.id !== id));
    navigate("/motoristas");
  };

  const motoristaParaEditar = driverId
    ? motoristas.find((d) => d.id === parseInt(driverId))
    : undefined;

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtros}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />
      <ListaDeMotoristas motoristas={motoristasFiltrados} />
      {outlet && (
        <ModalGlobal
          title={driverId ? "Editar Motorista" : "Novo Motorista"}
          onClose={() => navigate("/motoristas")}
          formId={
            driverId
              ? `form-editar-motorista-${driverId}`
              : "form-novo-motorista"
          }
        >
          <Outlet
            context={{
              onAdicionar: handleAdicionar,
              onEditar: handleEditar,
              onExcluir: handleExcluir,
              motorista: motoristaParaEditar,
            }}
          />
        </ModalGlobal>
      )}
    </div>
  );
}
