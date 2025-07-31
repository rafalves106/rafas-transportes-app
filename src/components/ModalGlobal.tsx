import { useEffect } from "react";
import styled from "styled-components";
import React from "react";

interface ModalGlobalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 70vw;
  max-height: 95vh;
  overflow: none;
  padding: 1.5rem;

  @media (max-width: 768px) {
    max-width: 75vw;
    overflow-y: auto;
  }
`;

const ModalHeader = styled.header`
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    margin: 0 1rem;
    padding: 0.5rem 0;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1.5rem;
  top: 1rem;
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

export const ModalFooter = styled.footer`
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0;
    align-items: center;
    justify-content: space-between;
  }
`;

export function ModalGlobal({ title, children, onClose }: ModalGlobalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <Backdrop>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Backdrop>
  );
}
