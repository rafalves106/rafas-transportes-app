import { styled } from "styled-components";

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

export const AddButton = styled.button`
  background: transparent;
  border: 1px dashed var(--cor-primaria);
  color: var(--cor-primaria);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  margin-top: 0.5rem;
`;

export const RemoveButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem;
  width: 100%;
  background-color: transparent;
  color: var(--cor-remover);
  border: 1px solid var(--cor-remover);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--cor-remover);
    color: white;
  }
`;
