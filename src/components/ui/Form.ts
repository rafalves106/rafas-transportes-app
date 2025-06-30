import { styled } from "styled-components";

export const FormContainer = styled.form``;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--cor-titulos-secundaria);
`;

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.9rem;
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.hasError ? "var(--cor-remover)" : "var(--cor-bordas)")};
  background-color: var(--cor-de-fundo);
  border-radius: 6px;
`;

export const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.9rem;
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.hasError ? "var(--cor-remover)" : "var(--cor-bordas)")};
  border-radius: 6px;
  background-color: var(--cor-de-fundo);
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--cor-bordas);
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 4rem;
  resize: vertical;
  background-color: var(--cor-de-fundo);
`;

export const ErrorMessage = styled.span`
  color: var(--cor-remover);
  font-size: 0.8rem;
  font-weight: 500;
`;
