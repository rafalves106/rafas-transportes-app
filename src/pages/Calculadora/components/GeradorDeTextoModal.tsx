import { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import type { Orcamento } from "../../../services/orcamentoService";
import { ModalGlobal } from "../../../components/ModalGlobal";
import { Button } from "../../../components/ui/Button";
import {
  InputGroup,
  Label,
  Input,
  Select,
  Textarea,
} from "../../../components/ui/Form";
import { InputRow } from "@/components/ui/Layout";

import CopyIcon from "../../../assets/copy.svg?react";
import CheckIcon from "../../../assets/check.svg?react";
import { highlightAnimation } from "@/styles/GlobalStyle";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const ModalFooter = styled.footer`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: var(--color-background);
`;

const TemplateSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
`;

const TemplateTitle = styled.h4`
  margin: 0;
  color: var(--color-title);
`;

const FormSectionInModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 1.5rem;
`;

const StyledButton = styled.button<{ $isAnimating?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--color-activeCardBackground);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;

  svg {
    width: 0.9rem;
    height: 0.9rem;
    transition: stroke 0.3s ease-in-out;
  }

  ${(props) =>
    props.$isAnimating &&
    css`
      animation: ${highlightAnimation} 1.5s ease-in-out;
    `}
`;

interface GeradorDeTextoModalProps {
  orcamento: Orcamento | null;
  onClose: () => void;
  onSalvar: (dadosCompletosOrcamento: Orcamento) => void;
}

const generateDescription = (
  tipoViagem: string,
  origem: string,
  destino: string,
  paradas: string
) => {
  let descricaoIda = "";
  let descricaoVolta = "";
  const paradasText =
    paradas && paradas.trim() !== "" ? ` Com paradas em: ${paradas}.` : "";

  switch (tipoViagem) {
    case "FRETAMENTO_AEROPORTO":
      descricaoIda = `Buscar passageiros em ${origem} e levar ao Aeroporto de Confins.`;
      descricaoVolta = `Buscar passageiros no Aeroporto de Confins e levar para ${destino}.`;
      break;
    case "IDA_E_VOLTA_MG":
      descricaoIda = `Percurso de ida para ${destino}. Saindo de ${origem}.${paradasText}`;
      descricaoVolta = `Percurso de volta de ${destino} para ${origem}.${paradasText}`;
      break;
    case "SOMENTE_IDA_MG":
      descricaoIda = `Percurso somente de ida para ${destino}. Saindo de ${origem}.${paradasText}`;
      descricaoVolta = "";
      break;
    case "IDA_E_VOLTA_FORA_MG":
      descricaoIda = `Percurso ida e volta saindo de ${origem} para ${destino}.${paradasText}`;
      descricaoVolta = `Volta do percurso saindo de ${destino} para ${origem}.${paradasText}`;
      break;
    case "SOMENTE_IDA_FORA_MG":
      descricaoIda = `Percurso somente ida saindo de ${origem} para ${destino}.${paradasText}`;
      descricaoVolta = "";
      break;
    default:
      descricaoIda = `Percurso de ${origem} para ${destino}.`;
      descricaoVolta = tipoViagem.includes("IDA_E_VOLTA")
        ? `Retorno de ${destino} para ${origem}.`
        : "";
      break;
  }
  return { descricaoIda, descricaoVolta };
};

export function GeradorDeTextoModal({
  orcamento,
  onClose,
  onSalvar,
}: GeradorDeTextoModalProps) {
  const [nomeClienteLocal, setNomeClienteLocal] = useState(
    orcamento?.nomeCliente || ""
  );
  const [telefoneLocal, setTelefoneLocal] = useState(orcamento?.telefone || "");
  const [tipoViagemLocal, setTipoViagemLocal] = useState(
    orcamento?.tipoViagemOrcamento || "IDA_E_VOLTA_MG"
  );
  const [descricaoIdaLocal, setDescricaoIdaLocal] = useState(
    orcamento?.descricaoIdaOrcamento || ""
  );
  const [descricaoVoltaLocal, setDescricaoVoltaLocal] = useState(
    orcamento?.descricaoVoltaOrcamento || ""
  );
  const [textoGeradoLocal, setTextoGeradoLocal] = useState(
    orcamento?.textoGerado || ""
  );

  const mostraVolta = tipoViagemLocal.includes("IDA_E_VOLTA");

  const [textoCopiadoFeedback, setTextoCopiadoFeedback] = useState<
    "whatsapp" | "email" | null
  >(null);

  const [animatingCopy, setAnimatingCopy] = useState<
    "whatsapp" | "email" | null
  >(null);

  useEffect(() => {
    if (orcamento) {
      setNomeClienteLocal(orcamento.nomeCliente || "");
      setTelefoneLocal(orcamento.telefone || "");

      const tipoViagemInicial =
        orcamento.tipoViagemOrcamento || "IDA_E_VOLTA_MG";
      setTipoViagemLocal(tipoViagemInicial);

      const { descricaoIda, descricaoVolta } = generateDescription(
        tipoViagemInicial,
        orcamento.origem,
        orcamento.destino,
        orcamento.paradas
      );
      setDescricaoIdaLocal(descricaoIda);
      setDescricaoVoltaLocal(descricaoVolta);

      setTextoGeradoLocal(orcamento.textoGerado || "");
    }
  }, [orcamento]);

  useEffect(() => {
    if (!orcamento) return;

    const { descricaoIda, descricaoVolta } = generateDescription(
      tipoViagemLocal,
      orcamento.origem,
      orcamento.destino,
      orcamento.paradas
    );
    setDescricaoIdaLocal(descricaoIda);
    setDescricaoVoltaLocal(descricaoVolta);

    const valorFormatado = orcamento.valorTotal?.toFixed(2);
    setTextoGeradoLocal(
      `Orçamento para ${nomeClienteLocal}: ${tipoViagemLocal} de ${orcamento.origem} para ${orcamento.destino}. Valor: R$ ${valorFormatado}.`
    );
  }, [tipoViagemLocal, orcamento, nomeClienteLocal]);

  if (!orcamento) {
    return null;
  }

  const { origem, destino, paradas, valorTotal } = orcamento;

  let descricaoDaRota = "";
  if (paradas && paradas.trim() !== "") {
    descricaoDaRota = `de *${origem}* passando por *${paradas}* com destino a *${destino}*`;
  } else {
    descricaoDaRota = `de *${origem}* para *${destino}*`;
  }

  const templateWhatsApp = `*Orçamento Rafas Transportes* 🚐

Olá! Segue o orçamento para a viagem ${descricaoDaRota}.

Valor Total: *R$ ${valorTotal?.toFixed(2)}*

Este valor inclui todos os custos de pedágio, combustível e despesas do motorista.

Qualquer dúvida, estou à disposição!`;

  const templateEmail = `Prezado(a) Cliente,

Conforme solicitado, segue abaixo o orçamento detalhado para o serviço de transporte.

Rota: ${descricaoDaRota.replace(/\*/g, "")}

--- DETALHES DO CUSTO ---
- Custo com Distância e Veículo: R$ ${
    orcamento.custoDistancia?.toFixed(2) || "0.00"
  }
- Custo com Pedágios: R$ ${orcamento.custoPedagios?.toFixed(2) || "0.00"}
- Custo com Combustivel: R$ ${orcamento.custoCombustivel?.toFixed(2) || "0.00"}
- Custo com Motorista(s): R$ ${orcamento.custoMotorista?.toFixed(2) || "0.00"}

---
*VALOR TOTAL DO SERVIÇO: R$ ${valorTotal?.toFixed(2)}*

Agradecemos a preferência e ficamos à disposição para quaisquer esclarecimentos.

Atenciosamente,
Equipe Rafas Transportes`;

  const handleCopiar = (texto: string, tipo: "whatsapp" | "email") => {
    setAnimatingCopy(tipo);
    navigator.clipboard.writeText(texto).then(() => {
      setTextoCopiadoFeedback(tipo);
      setTimeout(() => {
        setTextoCopiadoFeedback(null);
        setAnimatingCopy(null);
      }, 1500);
    });
  };

  const handleSalvarEFechar = () => {
    const orcamentoAtualizado: Orcamento = {
      ...orcamento,
      nomeCliente: nomeClienteLocal,
      telefone: telefoneLocal,
      tipoViagemOrcamento: tipoViagemLocal,
      descricaoIdaOrcamento: descricaoIdaLocal,
      descricaoVoltaOrcamento: descricaoVoltaLocal,
      textoGerado: textoGeradoLocal,
    };
    onSalvar(orcamentoAtualizado);
    onClose();
  };

  return (
    <ModalGlobal title="Gerar Textos para Orçamento" onClose={onClose}>
      <Container>
        <div style={{ flex: 1 }}>
          <FormSectionInModal>
            <TemplateTitle>Dados do Orçamento</TemplateTitle>
            <InputRow>
              <InputGroup>
                <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  name="nomeCliente"
                  type="text"
                  value={nomeClienteLocal}
                  onChange={(e) => setNomeClienteLocal(e.target.value)}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label htmlFor="telefone">Telefone do Cliente</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={telefoneLocal}
                  onChange={(e) => setTelefoneLocal(e.target.value)}
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Label htmlFor="tipoViagem">Tipo de Viagem do Orçamento</Label>
              <Select
                id="tipoViagem"
                name="tipoViagem"
                value={tipoViagemLocal}
                onChange={(e) => setTipoViagemLocal(e.target.value)}
              >
                <option value="FRETAMENTO_AEROPORTO">
                  Fretamento Aeroporto
                </option>
                <option value="IDA_E_VOLTA_MG">Viagem Ida e Volta - MG</option>
                <option value="SOMENTE_IDA_MG">Viagem Somente Ida - MG</option>
                <option value="IDA_E_VOLTA_FORA_MG">
                  Viagem Ida e Volta - Fora de MG
                </option>
                <option value="SOMENTE_IDA_FORA_MG">
                  Viagem Somente Ida - Fora de MG
                </option>
              </Select>
            </InputGroup>

            <InputRow>
              <InputGroup>
                <Label htmlFor="descricaoIda">Percurso de Ida</Label>
                <Textarea
                  style={{ minHeight: "7rem" }}
                  id="descricaoIda"
                  name="descricaoIda"
                  value={descricaoIdaLocal}
                  onChange={(e) => setDescricaoIdaLocal(e.target.value)}
                />
              </InputGroup>
              {mostraVolta && (
                <InputGroup>
                  <Label htmlFor="descricaoVolta">Percurso de Volta</Label>
                  <Textarea
                    style={{ minHeight: "7rem" }}
                    id="descricaoVolta"
                    name="descricaoVolta"
                    value={descricaoVoltaLocal}
                    onChange={(e) => setDescricaoVoltaLocal(e.target.value)}
                  />
                </InputGroup>
              )}
            </InputRow>
          </FormSectionInModal>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <InputRow>
            <TemplateSection>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TemplateTitle>WhatsApp</TemplateTitle>
                <StyledButton
                  onClick={() => handleCopiar(templateWhatsApp, "whatsapp")}
                  $isAnimating={animatingCopy === "whatsapp"}
                >
                  {textoCopiadoFeedback === "whatsapp" ? (
                    <CheckIcon stroke="var(--color-success)" />
                  ) : (
                    <CopyIcon stroke="var(--color-primary)" />
                  )}
                </StyledButton>
              </div>
              <Textarea
                style={{ minHeight: "20rem" }}
                readOnly
                value={templateWhatsApp}
              />
            </TemplateSection>
            <TemplateSection>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TemplateTitle>E-mail</TemplateTitle>
                <StyledButton
                  onClick={() => handleCopiar(templateEmail, "email")}
                  $isAnimating={animatingCopy === "email"}
                >
                  {textoCopiadoFeedback === "email" ? (
                    <CheckIcon stroke="var(--color-success)" />
                  ) : (
                    <CopyIcon stroke="var(--color-primary)" />
                  )}
                </StyledButton>
              </div>

              <Textarea
                style={{ minHeight: "20rem" }}
                readOnly
                value={templateEmail}
              />
            </TemplateSection>
          </InputRow>
        </div>
      </Container>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleSalvarEFechar}>
          Salvar Orçamento
        </Button>
      </ModalFooter>
    </ModalGlobal>
  );
}
