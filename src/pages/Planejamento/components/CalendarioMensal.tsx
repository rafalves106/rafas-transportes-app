import styled from "styled-components";
import { Link } from "react-router-dom";
import type { Viagem } from "../../../services/viagemService";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

interface CalendarioMensalProps {
  mesExibido: Date;
  viagens: Viagem[];
}

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  background-color: transparent;
  padding: 0 2rem;
`;

const DayHeader = styled.div`
  font-weight: 600;
  text-align: start;
  font-size: 0.8rem;
`;

const DayCell = styled.div<{ isToday: boolean; isCurrentMonth: boolean }>`
  background-color: ${(props) =>
    props.isCurrentMonth
      ? "var(--cor-de-fundo-cards)"
      : "var(--cor-de-fundo-cards)"};
  background-color: ${(props) =>
    props.isToday
      ? "var(--cor-de-fundo-cards-ativo)"
      : "var(--cor-de-fundo-cards)"};
  min-height: 80px;
  padding: 0.25rem;
  opacity: ${(props) => (props.isCurrentMonth ? 1 : 0.5)};
  font-size: 0.7rem;
  color: ${(props) => (props.isToday ? "var(--cor-secundaria)" : "inherit")};
  font-weight: ${(props) => (props.isToday ? "bold" : "normal")};
  border-radius: 8px;
`;

const TripInCalendar = styled(Link)`
  background-color: var(--cor-fundo-card);
  color: var(--cor-primaria);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
  }
`;

export function CalendarioMensal({
  mesExibido,
  viagens,
}: CalendarioMensalProps) {
  const hoje = new Date();
  const primeiroDiaDoMes = startOfMonth(mesExibido);
  const ultimoDiaDoMes = endOfMonth(mesExibido);

  const inicioDaGrade = startOfWeek(primeiroDiaDoMes);
  const fimDaGrade = endOfWeek(ultimoDiaDoMes);

  const dias = eachDayOfInterval({ start: inicioDaGrade, end: fimDaGrade });
  const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <>
      <CalendarGrid>
        {diasDaSemana.map((dia) => (
          <DayHeader key={dia}>{dia}</DayHeader>
        ))}

        {dias.map((dia) => {
          const viagensDoDia = viagens.filter((v) =>
            isSameDay(new Date(v.startDate + "T00:00"), dia)
          );

          return (
            <DayCell
              key={dia.toString()}
              isToday={isSameDay(dia, hoje)}
              isCurrentMonth={isSameMonth(dia, mesExibido)}
            >
              <div>{format(dia, "d")}</div>
              {viagensDoDia.map((viagem) => (
                <TripInCalendar key={viagem.id} to={`/editar/${viagem.id}`}>
                  {viagem.title}
                </TripInCalendar>
              ))}
            </DayCell>
          );
        })}
      </CalendarGrid>
    </>
  );
}
