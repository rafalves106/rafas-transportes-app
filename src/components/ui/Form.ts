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
  color: var(--color-secondaryTitle);
`;

export const Input = styled.input<{ hasError?: boolean }>`
  color: var(--color-text);
  width: 100%;
  font-size: 0.8rem;
  padding: 0.5rem;
  border: 1px solid
    ${(props) =>
      props.hasError ? "var(--color-alert)" : "var(--color-border)"};
  background-color: transparent;
  border-radius: 6px;
  margin-bottom: 1rem;
`;

export const Select = styled.select<{ hasError?: boolean }>`
  color: var(--color-text);
  width: 100%;
  font-size: 0.8rem;
  padding: 0.5rem;
  border: 1px solid
    ${(props) =>
      props.hasError ? "var(--color-alert)" : "var(--color-border)"};
  border-radius: 6px;
  background-color: transparent;
  margin-bottom: 1rem;
`;

export const Textarea = styled.textarea`
  color: var(--color-text);
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.8rem;
  min-height: 3rem;
  resize: vertical;
  background-color: transparent;
  margin-bottom: 1rem;
`;

export const ErrorMessage = styled.span`
  color: var(--color-alert);
  font-size: 0.8rem;
  font-weight: 500;
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  color: var(--color-title);
  font-weight: 600;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    border: none;
    padding: 0;
  }
`;
