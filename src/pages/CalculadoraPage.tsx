import { useState } from "react";
import styled from "styled-components";
import { FormularioOrcamento } from "./Calculadora/components/FormularioOrcamento";
import { ListaDeOrcamentos } from "./Calculadora/components/ListaDeOrcamentos";
import { Button } from "../components/ui/Button";
import type { Orcamento } from "../data/orcamentosData";
import { orcamentosData as initialOrcamentos } from "../data/orcamentosData";
import { format } from "date-fns";

interface GooglePrice {
  currencyCode?: string;
  units?: string;
  nanos?: number;
}

export interface OrcamentoForm {
  origem: string;
  destino: string;
  paradas: string[];
  veiculos: { id: string; passageiros: number }[];
  motoristas: { id: string }[];
}

interface OrcamentoResultado {
  distanciaTotal: number;
  tempoEstimado: string;
  custoDistancia: number;
  custoPedagios: number;
  custoCombustivel: number;
  custoMotorista: number;
  valorTotal: number;
}

const CalculadoraContainer = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  padding: 0 2rem;
`;

const FormSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
  overflow-y: auto;
  max-height: calc(100vh - 180px);
`;

const ResultadoSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
`;

const ResultadoTitulo = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid var(--cor-bordas);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  color: var(--cor-titulos);
`;

export function CalculadoraPage() {
  const [resultado, setResultado] = useState<OrcamentoResultado | null>(null);
  const [ultimoForm, setUltimoForm] = useState<OrcamentoForm | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialOrcamentos);

  const handleCalcular = async (dados: OrcamentoForm) => {
    console.log("Iniciando cálculo com os dados:", dados);
    setUltimoForm(dados);

    const requestBody = {
      origin: { address: dados.origem },
      destination: { address: dados.destino },
      travelMode: "DRIVE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        vehicleInfo: {
          emissionType: "DIESEL",
        },
        tollPasses: [],
      },
      extraComputations: ["TOLLS"],
    };

    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": import.meta.env.VITE_Maps_API_KEY,
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Resposta da API do Google:", data);

      const rota = data.routes[0];
      const distanciaEmKm = rota.distanceMeters / 1000;
      const custoPedagios =
        rota.travelAdvisory?.tollInfo?.estimatedPrice.reduce(
          (total: number, price: GooglePrice) =>
            total + parseFloat(price.units || "0"),
          0
        ) || 0;

      const custoDistancia = distanciaEmKm * 3.9;
      const custoCombustivel = (distanciaEmKm / 10) * 5.5;
      const custoMotorista = 200 * (dados.motoristas.length || 1);
      const valorTotal =
        custoPedagios + custoCombustivel + custoMotorista + custoDistancia;

      setResultado({
        distanciaTotal: Math.round(distanciaEmKm),
        tempoEstimado: format(
          new Date(0, 0, 0, 0, 0, parseInt(rota.duration.replace("s", ""))),
          "HH:mm"
        ),
        custoDistancia: custoDistancia,
        custoPedagios: custoPedagios,
        custoCombustivel: custoCombustivel,
        custoMotorista: custoMotorista,
        valorTotal: valorTotal,
      });
    } catch (error) {
      console.error("Falha ao calcular a rota:", error);
      alert(
        "Não foi possível calcular a rota. Verifique os endereços e tente novamente."
      );
      setResultado(null);
    }
  };

  const handleSalvarOrcamento = () => {
    if (!resultado || !ultimoForm) return;

    const novoOrcamento: Orcamento = {
      id: Date.now(),
      title: `Orçamento: ${ultimoForm.origem} para ${ultimoForm.destino}`,
      clientName: "Cliente a definir",
      ...resultado,
      formData: ultimoForm,
      status: "Pendente",
    };

    setOrcamentos((prev) => [novoOrcamento, ...prev]);
    alert("Orçamento salvo com sucesso!");
  };

  return (
    <>
      <CalculadoraContainer>
        <FormSection>
          <FormularioOrcamento onCalcular={handleCalcular} />
        </FormSection>
        <ResultadoSection>
          <ResultadoTitulo>Resumo do Orçamento</ResultadoTitulo>
          {resultado ? (
            <div>
              <p>
                <strong>Distância Total:</strong> {resultado.distanciaTotal} km
              </p>
              <p>
                <strong>Custo com Distância:</strong> R${" "}
                {resultado.custoDistancia.toFixed(2)}
              </p>
              <p>
                <strong>Custo com Pedágios:</strong> R${" "}
                {resultado.custoPedagios.toFixed(2)}
              </p>
              <p>
                <strong>Custo com Combustível:</strong> R${" "}
                {resultado.custoCombustivel.toFixed(2)}
              </p>
              <p>
                <strong>Custo com Motorista(s):</strong> R${" "}
                {resultado.custoMotorista.toFixed(2)}
              </p>
              <hr />
              <h4>
                <strong>
                  Valor Total Sugerido: R$ {resultado.valorTotal.toFixed(2)}
                </strong>
              </h4>

              <Button
                variant="primary"
                onClick={handleSalvarOrcamento}
                style={{ marginTop: "1.5rem", width: "100%" }}
              >
                Salvar Orçamento
              </Button>
            </div>
          ) : (
            <p>Preencha os dados ao lado para calcular o orçamento.</p>
          )}
        </ResultadoSection>
      </CalculadoraContainer>
      <ListaDeOrcamentos orcamentos={orcamentos} />
    </>
  );
}
