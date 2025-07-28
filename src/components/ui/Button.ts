import styled, { css } from "styled-components";

const baseButtonStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0rem;
  min-width: 10rem;
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
  background-color: var(--color-primary);
  color: var(--color-title);
  border-color: var(--color-primary);
`;

const secondaryStyles = css`
  background-color: var(--color-infoText);
  color: var(--color-title);
  border-color: var(--color-border);

  &:hover {
    filter: none;
    background-color: var(--color-background);
  }
`;

const dangerStyles = css`
  background-color: transparent;
  color: var(--color-alert);
  border-color: var(--color-alert);

  &:hover {
    filter: none;
    background-color: var(--color-alert);
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
    isActive ? "var(--color-title)" : "var(--color-secondaryTitle)"};

  &:hover {
    filter: none;
    color: var(--color-title);
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
