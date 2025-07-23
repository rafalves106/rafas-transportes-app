import styled, { css } from "styled-components";

const baseButtonStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0rem;
  height: 2.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    filter: brightness(0.8);
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: 0rem;
    padding: 0.5rem 0.5rem;
  }
`;

const primaryStyles = css`
  background-color: var(--cor-primaria);
  color: white;
  border-color: var(--cor-primaria);
`;

const secondaryStyles = css`
  background-color: white;
  color: #555;
  border-color: #ccc;

  &:hover {
    filter: none;
    background-color: #f8f9fa;
  }
`;

const dangerStyles = css`
  background-color: transparent;
  color: var(--cor-remover);
  border-color: var(--cor-remover);

  &:hover {
    filter: none;
    background-color: var(--cor-remover);
    color: white;
  }
`;

const filterStyles = css<{ isActive?: boolean }>`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0.5rem 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ isActive }) =>
    isActive ? "var(--cor-titulos)" : "var(--cor-titulos-secundaria)"};

  &:hover {
    filter: none;
    color: var(--cor-titulos);
  }
`;

export const Button = styled.button<{
  variant?: "primary" | "secondary" | "danger" | "filter";
  isActive?: boolean;
}>`
  ${baseButtonStyles}

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return primaryStyles;
      case "secondary":
        return secondaryStyles;
      case "danger":
        return dangerStyles;
      case "filter":
        return filterStyles;
      default:
        return primaryStyles;
    }
  }}
`;

export const BotaoPaginacao = styled.button`
  cursor: pointer;
  background-color: transparent;

  img {
    width: 22px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
