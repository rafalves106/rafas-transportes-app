/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.veiculo.log.QuilometragemLog;

import java.time.LocalDateTime;

public record DadosDetalhamentoQuilometragemLog(
        Long id,
        Long veiculoId,
        LocalDateTime dataHoraRegistro,
        Integer quilometragemAnterior,
        Integer quilometragemAtual,
        String origemAlteracao,
        Long idReferenciaOrigem
) {
    public DadosDetalhamentoQuilometragemLog(QuilometragemLog log) {
        this(log.getId(),
                log.getVeiculo().getId(),
                log.getDataHoraRegistro(),
                log.getQuilometragemAnterior(),
                log.getQuilometragemAtual(),
                log.getOrigemAlteracao(),
                log.getIdReferenciaOrigem());
    }
}