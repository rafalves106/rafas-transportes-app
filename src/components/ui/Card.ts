import { Link } from "react-router-dom";
import { styled } from "styled-components";

export const CardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: var(--cor-titulos);
`;

export const DetailsLink = styled(Link)`
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--cor-primaria);
`;
