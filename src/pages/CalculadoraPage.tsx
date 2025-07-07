import { useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";

import type { Orcamento } from "../data/orcamentosData";
import { orcamentosData as initialOrcamentos } from "../data/orcamentosData";

import { FormularioOrcamento } from "./Calculadora/components/FormularioOrcamento";
import { ListaDeOrcamentos } from "./Calculadora/components/ListaDeOrcamentos";
import { GeradorDeTextoModal } from "./Calculadora/components/GeradorDeTextoModal";

import { Button } from "../components/ui/Button";
import { InputGroup, Label, Input } from "../components/ui/Form";

interface GooglePrice {
  currencyCode?: string;
  units?: string;
  nanos?: number;
}

interface GoogleRoute {
  distanceMeters: number;
  duration: string;
  travelAdvisory?: {
    tollInfo?: {
      estimatedPrice: GooglePrice[];
    };
  };
}

export interface OrcamentoForm {
  origem: string;
  destino: string;
  paradas: string[];
  numeroVeiculos: number;
  numeroMotoristas: number;
  quantidadeDiarias: number;
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

// Styled Components
const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1.3fr 1.4fr;
  padding: 0 2rem;
  column-gap: 2rem;
  align-items: start;
`;

const CalculadoraContainer = styled.div`
  display: flex;
  align-items: start;
`;

const ParametrosSection = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
`;

const FormSection = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
  overflow-y: auto;
  max-height: calc(100vh - 120px);
`;

const ResultadoTitulo = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--cor-titulos);
`;

const ResultadoSection = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
`;

export function CalculadoraPage() {
  const [resultado, setResultado] = useState<OrcamentoResultado[] | null>(null);
  const [ultimoForm, setUltimoForm] = useState<OrcamentoForm | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialOrcamentos);
  const [parametros, setParametros] = useState({
    precoDiesel: 5.5,
    diariaMotorista: 200.0,
    custoKmRodado: 3.9,
    extras: 0,
  });
  const [orcamentoParaGerarTexto, setOrcamentoParaGerarTexto] =
    useState<Orcamento | null>(null);

  const handleParametroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParametros((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCalcular = async (dados: OrcamentoForm) => {
    setUltimoForm(dados);

    const requestBody = {
      origin: { address: dados.origem },
      destination: { address: dados.destino },
      intermediates: dados.paradas
        .filter((p) => p.trim() !== "")
        .map((parada) => ({ address: parada })),
      travelMode: "DRIVE",
      computeAlternativeRoutes: true,
      routeModifiers: {
        vehicleInfo: {
          emissionType: "DIESEL",
        },
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

      if (!data.routes || data.routes.length === 0) {
        throw new Error(
          "Nenhuma rota encontrada para os endereços fornecidos."
        );
      }

      const resultadosCalculados = data.routes.map((rota: GoogleRoute) => {
        const distanciaEmKm = rota.distanceMeters / 1000;
        const custoPedagios =
          rota.travelAdvisory?.tollInfo?.estimatedPrice?.reduce(
            (total: number, price: GooglePrice) =>
              total + parseFloat(price.units || "0"),
            0
          ) || 0;

        const custoDistancia =
          distanciaEmKm * parametros.custoKmRodado * dados.numeroVeiculos;
        const custoCombustivel =
          (distanciaEmKm / 10) * parametros.precoDiesel * dados.numeroVeiculos;
        const custoMotorista =
          dados.numeroMotoristas *
          dados.quantidadeDiarias *
          parametros.diariaMotorista;
        const valorTotal =
          custoPedagios +
          custoCombustivel +
          custoMotorista +
          custoDistancia +
          parametros.extras;

        return {
          distanciaTotal: Math.round(distanciaEmKm),
          tempoEstimado: rota.duration
            ? format(
                new Date(
                  0,
                  0,
                  0,
                  0,
                  0,
                  parseInt(rota.duration.replace("s", ""))
                ),
                "HH:mm"
              )
            : "N/A",
          custoDistancia,
          custoPedagios,
          custoCombustivel,
          custoMotorista,
          valorTotal,
        };
      });

      setResultado(resultadosCalculados);
    } catch (error) {
      console.error("Falha ao calcular a rota:", error);
      alert(
        `Não foi possível calcular a rota. Detalhe: ${
          error instanceof Error ? error.message : ""
        }`
      );
      setResultado(null);
    }
  };

  const handleAbrirModalTexto = (resultadoEscolhido: OrcamentoResultado) => {
    if (!ultimoForm) return;
    const orcamentoTemporario: Orcamento = {
      id: Date.now(),
      title: `Orçamento: ${ultimoForm.origem} para ${ultimoForm.destino}`,
      clientName: "Cliente a definir",
      ...resultadoEscolhido,
      formData: ultimoForm,
      status: "Pendente",
    };
    setOrcamentoParaGerarTexto(orcamentoTemporario);
  };

  const handleSalvarOrcamentoDeVerdade = () => {
    if (!orcamentoParaGerarTexto) return;

    setOrcamentos((prev) => [orcamentoParaGerarTexto, ...prev]);
    alert("Orçamento salvo com sucesso!");

    setOrcamentoParaGerarTexto(null);
    setResultado(null);
  };

  return (
    <PageContainer>
      <ParametrosSection>
        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Parâmetros</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          <InputGroup>
            <Label>Preço Diesel (Litro)</Label>
            <Input
              type="number"
              name="precoDiesel"
              value={parametros.precoDiesel}
              onChange={handleParametroChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>Diária Motorista (R$)</Label>
            <Input
              type="number"
              name="diariaMotorista"
              value={parametros.diariaMotorista}
              onChange={handleParametroChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>Custo por KM Rodado (R$)</Label>
            <Input
              type="number"
              name="custoKmRodado"
              value={parametros.custoKmRodado}
              onChange={handleParametroChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>Custos Extras (R$)</Label>
            <Input
              type="number"
              name="extras"
              value={parametros.extras}
              onChange={handleParametroChange}
            />
          </InputGroup>
        </div>
      </ParametrosSection>
      <CalculadoraContainer>
        <FormSection>
          <h3 style={{ marginBottom: "1rem" }}>Dados da Viagem</h3>
          <FormularioOrcamento onCalcular={handleCalcular} />
        </FormSection>
      </CalculadoraContainer>
      <ResultadoSection>
        <ResultadoTitulo>Resumo do Orçamento</ResultadoTitulo>
        {resultado && resultado.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {resultado.map((res, index) => (
              <div key={index}>
                <p>
                  <strong>Distância Total:</strong> {res.distanciaTotal} km
                </p>
                <p>
                  <strong>Custo com Pedágios:</strong> R${" "}
                  {res.custoPedagios.toFixed(2)}
                </p>
                <p>
                  <strong>
                    Valor Total Sugerido: R$ {res.valorTotal.toFixed(2)}
                  </strong>
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleAbrirModalTexto(res)}
                  style={{ marginTop: "1rem", width: "100%" }}
                >
                  Gerar Textos / Salvar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>
            Preencha os dados ao lado e clique em "Calcular" para ver o
            resultado.
          </p>
        )}
      </ResultadoSection>
      <ListaDeOrcamentos orcamentos={orcamentos} />
      <GeradorDeTextoModal
        orcamento={orcamentoParaGerarTexto}
        onClose={() => setOrcamentoParaGerarTexto(null)}
        onSalvar={handleSalvarOrcamentoDeVerdade}
      />
    </PageContainer>
  );
}
