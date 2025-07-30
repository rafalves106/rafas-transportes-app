import { useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";

import type {
  Orcamento,
  CadastroOrcamentoData,
} from "../services/orcamentoService";
import { orcamentoService } from "../services/orcamentoService";

import { FormularioOrcamento } from "./Calculadora/components/FormularioOrcamento";
import { GeradorDeTextoModal } from "./Calculadora/components/GeradorDeTextoModal";

import { Button } from "../components/ui/Button";
import { InputGroup, Label, Input } from "../components/ui/Form";
import axios, { AxiosError } from "axios";

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

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ParametrosSection = styled.div`
  background-color: var(--color-background);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
`;

const FormSection = styled.div`
  background-color: var(--color-background);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  overflow-y: auto;
  grid-column: 1 / span 2;
`;

const ResultadoTitulo = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-title);
`;

const ResultadoSection = styled.div`
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
`;

export function CalculadoraPage() {
  const [resultado, setResultado] = useState<OrcamentoResultado[] | null>(null);
  const [ultimoForm, setUltimoForm] = useState<OrcamentoForm | null>(null);
  const [parametros, setParametros] = useState({
    precoDiesel: 5.5,
    diariaMotorista: 200.0,
    custoKmRodado: 3.9,
    extras: 0,
  });

  const handleSalvarOrcamento = async (dadosCompletosOrcamento: Orcamento) => {
    if (!dadosCompletosOrcamento) return;

    const dadosParaApi: CadastroOrcamentoData = {
      nomeCliente: dadosCompletosOrcamento.nomeCliente || "Cliente a definir",
      telefone: dadosCompletosOrcamento.telefone || "",
      origem: dadosCompletosOrcamento.origem,
      destino: dadosCompletosOrcamento.destino,
      distancia: dadosCompletosOrcamento.distancia,
      paradas: dadosCompletosOrcamento.paradas,
      valorTotal: dadosCompletosOrcamento.valorTotal,
      tipoViagemOrcamento: dadosCompletosOrcamento.tipoViagemOrcamento,
      descricaoIdaOrcamento: dadosCompletosOrcamento.descricaoIdaOrcamento,
      descricaoVoltaOrcamento: dadosCompletosOrcamento.descricaoVoltaOrcamento,
      textoGerado: dadosCompletosOrcamento.textoGerado,
    };

    try {
      await orcamentoService.salvar(dadosParaApi);
      alert("Orçamento salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar orçamento:", err);
      if (axios.isAxiosError(err)) {
        const axiosError: AxiosError = err;
        if (axiosError.response) {
          if (axiosError.response.status === 403) {
            alert("Acesso negado. Por favor, faça login novamente.");
          } else {
            alert(
              `Erro ao salvar orçamento: ${axiosError.response.status} - ${axiosError.response.statusText}`
            );
          }
        } else {
          alert(`Erro de rede ou requisição: ${axiosError.message}`);
        }
      } else if (err instanceof Error) {
        alert(`Erro ao salvar orçamento: ${err.message}`);
      } else {
        alert("Erro desconhecido ao salvar orçamento.");
      }
    } finally {
      setOrcamentoParaGerarTexto(null);
    }
  };

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
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message ||
            `Erro na API do Google: ${response.statusText}`
        );
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
    } catch (err) {
      console.error("Falha ao calcular a rota:", err);
      if (err instanceof Error) {
        alert(`Não foi possível calcular a rota. Detalhe: ${err.message}`);
      } else {
        alert("Não foi possível calcular a rota. Erro desconhecido.");
      }
      setResultado(null);
    }
  };

  const handleAbrirModalTexto = (resultadoEscolhido: OrcamentoResultado) => {
    if (!ultimoForm) return;

    const orcamentoTemporario: Orcamento = {
      id: Date.now(),
      nomeCliente: "Cliente a definir",
      telefone: "",
      dataDoOrcamento: new Date().toISOString().split("T")[0],
      origem: ultimoForm.origem,
      destino: ultimoForm.destino,
      distancia: `${resultadoEscolhido.distanciaTotal} km`,
      paradas: ultimoForm.paradas.filter((p) => p.trim() !== "").join(", "),
      valorTotal: resultadoEscolhido.valorTotal,

      custoDistancia: resultadoEscolhido.custoDistancia,
      custoPedagios: resultadoEscolhido.custoPedagios,
      custoCombustivel: resultadoEscolhido.custoCombustivel,
      custoMotorista: resultadoEscolhido.custoMotorista,

      tipoViagemOrcamento: "ida_e_volta_mg",
      descricaoIdaOrcamento: "",
      descricaoVoltaOrcamento: "",
      textoGerado: "",
    };
    setOrcamentoParaGerarTexto(orcamentoTemporario);
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
            <Label>Custo por KM (R$)</Label>
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

      <MainGrid>
        <FormSection>
          <h3 style={{ marginTop: 0 }}>Dados da Viagem</h3>
          <FormularioOrcamento onCalcular={handleCalcular} />
        </FormSection>

        <ResultadoSection>
          <ResultadoTitulo>Resumo do Orçamento</ResultadoTitulo>
          {resultado ? (
            <div>
              {resultado.map((res, index) => (
                <div key={index} style={{ marginBottom: "1.5rem" }}>
                  <h4>Opção {index + 1}</h4>
                  <p>
                    <strong>Distância:</strong> {res.distanciaTotal} km
                  </p>
                  <p>
                    <strong>Pedágios:</strong> R$ {res.custoPedagios.toFixed(2)}
                  </p>
                  <p>
                    <strong>Valor Total: R$ {res.valorTotal.toFixed(2)}</strong>
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => handleAbrirModalTexto(res)}
                  >
                    Gerar Textos / Salvar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>Preencha o formulário para calcular.</p>
          )}
        </ResultadoSection>
      </MainGrid>

      <GeradorDeTextoModal
        orcamento={orcamentoParaGerarTexto}
        onClose={() => setOrcamentoParaGerarTexto(null)}
        onSalvar={handleSalvarOrcamento}
      />
    </PageContainer>
  );
}
