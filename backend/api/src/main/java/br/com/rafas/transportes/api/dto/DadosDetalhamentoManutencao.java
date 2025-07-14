/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Manutencao;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DadosDetalhamentoManutencao(
        Long id,
        String title,
        String type,
        LocalDate date,
        BigDecimal cost,
        String status,
        Long veiculoId,
        String veiculoDescricao
) {
    public DadosDetalhamentoManutencao(Manutencao manutencao) {
        this(
                manutencao.getId(),
                manutencao.getTitle(),
                manutencao.getType(),
                manutencao.getDate(),
                manutencao.getCost(),
                manutencao.getStatus(),
                manutencao.getVeiculo().getId(),
                manutencao.getVeiculo().getModel() + " - " + manutencao.getVeiculo().getPlate()
        );
    }
}