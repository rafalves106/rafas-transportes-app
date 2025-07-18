import { styled } from "styled-components";

export const FormContainer = styled.form`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--cor-titulos-secundaria);
`;

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.8rem;
  padding: 0.5rem;
  border: 1px solid
    ${(props) => (props.hasError ? "var(--cor-remover)" : "var(--cor-bordas)")};
  background-color: transparent;
  border-radius: 6px;

  @media (max-width: 768px) {
  }
`;

export const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.8rem;
  padding: 0.5rem;
  border: 1px solid
    ${(props) => (props.hasError ? "var(--cor-remover)" : "var(--cor-bordas)")};
  border-radius: 6px;
  background-color: transparent;
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--cor-bordas);
  border-radius: 6px;
  font-size: 0.8rem;
  min-height: 3rem;
  resize: vertical;
  background-color: transparent;
`;

export const ErrorMessage = styled.span`
  color: var(--cor-remover);
  font-size: 0.8rem;
  font-weight: 500;
`;
