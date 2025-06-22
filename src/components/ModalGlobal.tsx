import { useEffect } from "react";
import styled from "styled-components";
import React from "react";

interface ModalGlobalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  formId: string;
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContainer = styled.div`
  position: relative;
  background: var(--cor-de-fundo);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 580px;
  overflow: hidden;
`;

const ModalHeader = styled.header`
  margin: 0 1.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--cor-bordas);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: red;
  border-radius: 18px;
  width: 24px;
  height: 24px;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  font-weight: 400;
`;

const ModalBody = styled.div`
  padding: 1.5rem 2rem;
`;

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
`;

const BotaoAcao = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: filter 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.1);
  }
`;

const SalvarButton = styled(BotaoAcao)`
  background-color: var(--cor-primaria);
  color: white;
  border: none;
`;

const CancelarButton = styled(BotaoAcao)`
  background-color: white;
  color: #555;
  border: 1px solid #ccc;
`;

export function ModalGlobal({
  title,
  children,
  onClose,
  formId,
}: ModalGlobalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          <SalvarButton type="submit" form={formId}>
            Salvar
          </SalvarButton>
          <CancelarButton type="button" onClick={onClose}>
            Cancelar
          </CancelarButton>
        </ModalFooter>
      </ModalContainer>
    </Backdrop>
  );
}
