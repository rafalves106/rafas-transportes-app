import styled from "styled-components";

import { Button } from "./ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
`;

const ModalBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-secondaryTitle);
`;

const ModalMessage = styled.p`
  margin-bottom: 2rem;
  color: var(--color-infoText);
  font-size: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ButtonContainer>
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirmar
          </Button>
        </ButtonContainer>
      </ModalBox>
    </Backdrop>
  );
}
