import { useState } from "react";
import styled from "styled-components";
import type { Orcamento } from "../../../data/orcamentosData";
import { ModalGlobal } from "../../../components/ModalGlobal";
import { Button } from "../../../components/ui/Button";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TemplateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TemplateTitle = styled.h4`
  margin: 0;
  color: #343a40;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  background-color: #f8f9fa;
`;

interface GeradorDeTextoModalProps {
  orcamento: Orcamento | null;
  onClose: () => void;
}

export function GeradorDeTextoModal({
  orcamento,
  onClose,
}: GeradorDeTextoModalProps) {
  const [textoCopiado, setTextoCopiado] = useState<"whatsapp" | "email" | null>(
    null
  );

  if (!orcamento) {
    return null;
  }

  const templateWhatsApp = `*Orçamento Rafas Transportes* 🚐

Olá! Segue o orçamento para a viagem de *${orcamento.formData.origem}* para *${
    orcamento.formData.destino
  }*.

Valor Total: *R$ ${orcamento.valorTotal.toFixed(2)}*

Este valor inclui todos os custos de pedágio, combustível e despesas do motorista.

Qualquer dúvida, estou à disposição!`;

  const templateEmail = `Prezado(a) Cliente,

Conforme solicitado, segue abaixo o orçamento detalhado para o serviço de transporte.

Origem: ${orcamento.formData.origem}
Destino: ${orcamento.formData.destino}
${
  orcamento.formData.paradas.length > 0
    ? `Paradas: ${orcamento.formData.paradas.join(", ")}`
    : ""
}

--- DETALHES DO CUSTO ---
- Custo com Distância e Veículo: R$ ${orcamento.custoDistancia.toFixed(2)}
- Custo com Pedágios: R$ ${orcamento.custoPedagios.toFixed(2)}
- Custo com Combustível: R$ ${orcamento.custoCombustivel.toFixed(2)}
- Custo com Motorista(s): R$ ${orcamento.custoMotorista.toFixed(2)}

---
*VALOR TOTAL DO SERVIÇO: R$ ${orcamento.valorTotal.toFixed(2)}*

Agradecemos a preferência e ficamos à disposição para quaisquer esclarecimentos.

Atenciosamente,
Equipe Rafas Transportes`;

  const handleCopiar = (texto: string, tipo: "whatsapp" | "email") => {
    navigator.clipboard.writeText(texto).then(() => {
      setTextoCopiado(tipo);
      setTimeout(() => setTextoCopiado(null), 2000);
    });
  };

  return (
    <ModalGlobal
      title="Gerar Textos para Orçamento"
      onClose={onClose}
      formId=""
    >
      <Container>
        <TemplateSection>
          <TemplateTitle>Texto para WhatsApp</TemplateTitle>
          <TextArea readOnly value={templateWhatsApp} />
          <Button
            variant="secondary"
            onClick={() => handleCopiar(templateWhatsApp, "whatsapp")}
          >
            {textoCopiado === "whatsapp" ? "Copiado!" : "Copiar Texto"}
          </Button>
        </TemplateSection>

        <TemplateSection>
          <TemplateTitle>Texto para E-mail</TemplateTitle>
          <TextArea readOnly value={templateEmail} />
          <Button
            variant="secondary"
            onClick={() => handleCopiar(templateEmail, "email")}
          >
            {textoCopiado === "email" ? "Copiado!" : "Copiar Texto"}
          </Button>
        </TemplateSection>
      </Container>
    </ModalGlobal>
  );
}
