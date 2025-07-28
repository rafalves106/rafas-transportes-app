import { styled } from "styled-components";

export const ModalFooter = styled.footer`
  padding: 1.5rem;
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
