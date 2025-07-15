import { useState, useEffect } from "react";
import styled from "styled-components";
import type { Orcamento } from "../../../services/orcamentoService";
import { ModalGlobal } from "../../../components/ModalGlobal";
import { Button } from "../../../components/ui/Button";
import {
  InputGroup,
  Label,
  Input,
  Select,
  Textarea as UI_Textarea,
} from "../../../components/ui/Form";

const Container = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 5fr;
  justify-content: space-between;
  gap: 1.5rem;
`;

const ModalFooter = styled.footer`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--cor-bordas);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: #f8f9fa;
`;

const TemplateSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
`;

const TemplateTitle = styled.h4`
  margin: 0;
  color: #343a40;
`;

const StyledTextarea = styled(UI_Textarea)`
  width: 100%;
  min-height: 8rem;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.8rem;
  resize: vertical;
  background-color: #f8f9fa;
`;

const FormSectionInModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 1.5rem;
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
    case "fretamento_aeroporto":
      descricaoIda = `Buscar passageiros em ${origem} e levar ao Aeroporto de Confins.`;
      descricaoVolta = `Buscar passageiros no Aeroporto de Confins e levar para ${destino}.`;
      break;
    case "ida_e_volta_mg":
      descricaoIda = `Percurso de ida para ${destino}. Saindo de ${origem}.${paradasText}`;
      descricaoVolta = `Percurso de volta de ${destino} para ${origem}.${paradasText}`;
      break;
    case "somente_ida_mg":
      descricaoIda = `Percurso somente de ida para ${destino}. Saindo de ${origem}.${paradasText}`;
      descricaoVolta = "";
      break;
    case "ida_e_volta_fora_mg":
      descricaoIda = `Percurso ida e volta saindo de ${origem} para ${destino}.${paradasText}`;
      descricaoVolta = `Volta do percurso saindo de ${destino} para ${origem}.${paradasText}`;
      break;
    case "somente_ida_fora_mg":
      descricaoIda = `Percurso somente ida saindo de ${origem} para ${destino}.${paradasText}`;
      descricaoVolta = "";
      break;
    case "rota_colaboradores":
      descricaoIda = `Rota diária de colaboradores. Ponto de partida: ${origem}, destino: ${destino}.`;
      descricaoVolta = "";
      break;
    default:
      descricaoIda = `Percurso de ${origem} para ${destino}.`;
      descricaoVolta = tipoViagem.includes("ida_e_volta")
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
    orcamento?.tipoViagemOrcamento || "ida_e_volta_mg"
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

  const [textoCopiado, setTextoCopiado] = useState<"whatsapp" | "email" | null>(
    null
  );

  useEffect(() => {
    if (orcamento) {
      setNomeClienteLocal(orcamento.nomeCliente || "");
      setTelefoneLocal(orcamento.telefone || "");
      setTipoViagemLocal(orcamento.tipoViagemOrcamento || "ida_e_volta_mg");

      if (
        !orcamento.descricaoIdaOrcamento ||
        !orcamento.descricaoVoltaOrcamento ||
        orcamento.descricaoIdaOrcamento.includes("[") ||
        orcamento.descricaoVoltaOrcamento.includes("[")
      ) {
        const { descricaoIda, descricaoVolta } = generateDescription(
          orcamento.tipoViagemOrcamento || tipoViagemLocal,
          orcamento.origem,
          orcamento.destino,
          orcamento.paradas
        );
        setDescricaoIdaLocal(descricaoIda);
        setDescricaoVoltaLocal(descricaoVolta);
      } else {
        setDescricaoIdaLocal(orcamento.descricaoIdaOrcamento);
        setDescricaoVoltaLocal(orcamento.descricaoVoltaOrcamento);
      }

      if (!orcamento.textoGerado) {
        const valorFormatado = orcamento.valorTotal?.toFixed(2);
        setTextoGeradoLocal(
          `Orçamento para ${orcamento.nomeCliente}: ${tipoViagemLocal} de ${orcamento.origem} para ${orcamento.destino}. Valor: R$ ${valorFormatado}.`
        );
      } else {
        setTextoGeradoLocal(orcamento.textoGerado);
      }
    }
  }, [orcamento]);

  useEffect(() => {
    if (orcamento) {
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
        `Orçamento para ${nomeClienteLocal}: ${tipoViagemLocal} de ${orcamento.origem} para ${orcamento.destino}. Valor: R$ ${valorFormatado}. Detalhes: Ida - ${descricaoIda}, Volta - ${descricaoVolta}`
      );
    }
  }, [
    tipoViagemLocal,
    orcamento?.origem,
    orcamento?.destino,
    orcamento?.paradas,
    orcamento,
    nomeClienteLocal,
  ]);

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
    navigator.clipboard.writeText(texto).then(() => {
      setTextoCopiado(tipo);
      setTimeout(() => setTextoCopiado(null), 2000);
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
        <FormSectionInModal>
          <TemplateTitle>Dados do Orçamento</TemplateTitle>
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
          <InputGroup>
            <Label htmlFor="tipoViagem">Tipo de Viagem do Orçamento</Label>
            <Select
              id="tipoViagem"
              name="tipoViagem"
              value={tipoViagemLocal}
              onChange={(e) => setTipoViagemLocal(e.target.value)}
            >
              <option value="fretamento_aeroporto">Fretamento Aeroporto</option>
              <option value="ida_e_volta_mg">Viagem Ida e Volta - MG</option>
              <option value="somente_ida_mg">Viagem Somente Ida - MG</option>
              <option value="ida_e_volta_fora_mg">
                Viagem Ida e Volta - Fora de MG
              </option>
              <option value="somente_ida_fora_mg">
                Viagem Somente Ida - Fora de MG
              </option>
              <option value="rota_colaboradores">Rota de Colaboradores</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label htmlFor="descricaoIda">Descrição Percurso de Ida</Label>
            <StyledTextarea
              id="descricaoIda"
              name="descricaoIda"
              value={descricaoIdaLocal}
              onChange={(e) => setDescricaoIdaLocal(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="descricaoVolta">Descrição Percurso de Volta</Label>
            <StyledTextarea
              id="descricaoVolta"
              name="descricaoVolta"
              value={descricaoVoltaLocal}
              onChange={(e) => setDescricaoVoltaLocal(e.target.value)}
            />
          </InputGroup>
        </FormSectionInModal>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <TemplateSection>
            <TemplateTitle>Texto para WhatsApp</TemplateTitle>
            <StyledTextarea readOnly value={templateWhatsApp} />
            <Button
              variant="secondary"
              onClick={() => handleCopiar(templateWhatsApp, "whatsapp")}
            >
              {textoCopiado === "whatsapp" ? "Copiado!" : "Copiar Texto"}
            </Button>
          </TemplateSection>

          <TemplateSection>
            <TemplateTitle>Texto para E-mail</TemplateTitle>
            <StyledTextarea readOnly value={templateEmail} />
            <Button
              variant="secondary"
              onClick={() => handleCopiar(templateEmail, "email")}
            >
              {textoCopiado === "email" ? "Copiado!" : "Copiar Texto"}
            </Button>
          </TemplateSection>
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
