package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.HorarioItemRota;
import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import java.time.LocalTime; // Pode ser removido, pois LocalTime está em DadosHorarioItemRota
import java.util.List;
import java.util.stream.Collectors;

public record DadosDetalhamentoItemRotaColaborador(
        Long id,
        Long veiculoId,
        String veiculoInfo,
        Long motoristaId,
        String motoristaNome,
        List<DadosHorarioItemRota> horarios // <-- LISTA DE DTOS DE HORÁRIO
) {
    public DadosDetalhamentoItemRotaColaborador(ItemRotaColaborador item) {
        this(
                item.getId(),
                item.getVeiculo() != null ? item.getVeiculo().getId() : null,
                item.getVeiculo() != null ? item.getVeiculo().getModel() + " (" + item.getVeiculo().getPlate() + ")" : "Veículo não informado",
                item.getMotorista() != null ? item.getMotorista().getId() : null,
                item.getMotorista() != null ? item.getMotorista().getNome() : "Motorista não definido",
                item.getHorarios().stream() // Mapear a lista de horários
                        .map(DadosHorarioItemRota::new) // Usar o construtor do DTO
                        .collect(Collectors.toList())
        );
    }
}