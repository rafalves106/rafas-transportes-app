package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Ferias;

import java.time.LocalDate;

public record DadosDetalhamentoFerias(
        Long id,
        Long motoristaId,
        LocalDate dataInicio,
        LocalDate dataFim
) {
    public DadosDetalhamentoFerias(Ferias ferias) {
        this(
                ferias.getId(),
                ferias.getMotorista().getId(),
                ferias.getDataInicio(),
                ferias.getDataFim()
        );
    }
}