import { useState } from "react";
import styled from "styled-components";
import { FormularioOrcamento } from "./Calculadora/components/FormularioOrcamento";
import { ListaDeOrcamentos } from "./Calculadora/components/ListaDeOrcamentos";
import { Button } from "../components/ui/Button";
import type { Orcamento } from "../data/orcamentosData";
import { orcamentosData as initialOrcamentos } from "../data/orcamentosData";
import { format } from "date-fns";
import { GeradorDeTextoModal } from "./Calculadora/components/GeradorDeTextoModal";

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
  passageiros: number;
  veiculos: { id: string; passageiros: number }[];
  motoristas: { id: string; diarias: number }[];
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

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 2rem 2rem 2rem;
`;

const ParametrosSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
`;

const CalculadoraContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const FormSection = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--cor-bordas);
  overflow-y: auto;
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
    console.log("Iniciando cálculo com os dados:", dados);
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

        const custoDistancia = distanciaEmKm * parametros.custoKmRodado;
        const custoCombustivel = (distanciaEmKm / 10) * parametros.precoDiesel;
        const custoMotorista = dados.motoristas.reduce((total, motorista) => {
          return (
            total + Number(motorista.diarias || 1) * parametros.diariaMotorista
          );
        }, 0);
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

  const handleSalvarOrcamento = (resultadoEscolhido: OrcamentoResultado) => {
    if (!ultimoForm) return;

    const novoOrcamento: Orcamento = {
      id: Date.now(),
      title: `Orçamento: ${ultimoForm.origem} para ${ultimoForm.destino}`,
      clientName: "Cliente a definir",
      ...resultadoEscolhido,
      formData: ultimoForm,
      status: "Pendente",
    };

    setOrcamentos((prev) => [novoOrcamento, ...prev]);
    setOrcamentoParaGerarTexto(novoOrcamento);

    setResultado(null);
  };

  return (
    <PageContainer>
      <ParametrosSection>
        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Parâmetros do Cálculo
        </h3>
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
          <h3 style={{ marginTop: 0 }}>Dados da Viagem</h3>
          <FormularioOrcamento onCalcular={handleCalcular} />
        </FormSection>
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
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid var(--cor-bordas)",
                    paddingBottom: "1rem",
                  }}
                >
                  <h4>Opção {index + 1}</h4>
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
                    variant="secondary"
                    onClick={() => handleSalvarOrcamento(res)}
                    style={{ marginTop: "1rem", width: "100%" }}
                  >
                    Salvar este Orçamento
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
      </CalculadoraContainer>

      <ListaDeOrcamentos orcamentos={orcamentos} />

      <GeradorDeTextoModal
        orcamento={orcamentoParaGerarTexto}
        onClose={() => setOrcamentoParaGerarTexto(null)}
      />
    </PageContainer>
  );
}
