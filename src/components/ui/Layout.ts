import { styled } from "styled-components";

export const ListaContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 2rem;
`;

export const PaginacaoContainer = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 0;
  padding-right: 2rem;
  display: flex;
  justify-content: end;
  align-items: center;
`;

export const GroupContainer = styled.div`
  margin-bottom: 2rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;
