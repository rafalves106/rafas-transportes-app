import styled from "styled-components";
import { Button } from "../../../../components/ui/Button";

const Container = styled.div`
  margin-top: auto; // Empurra o botão para baixo, se dentro de um flex column
  padding-top: 1rem;
  border-top: 1px solid #eee;
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
