import styled from "styled-components";
import { Button } from "../../../../components/ui/Button";

const Container = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
`;

interface BotaoExcluirViagemProps {
  onClick: () => void;
}

export function BotaoExcluirViagem({ onClick }: BotaoExcluirViagemProps) {
  return (
    <Container>
      <Button variant="danger" type="button" onClick={onClick}>
        Excluir Viagem
      </Button>
    </Container>
  );
}
