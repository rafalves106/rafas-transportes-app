/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DadosCadastroQuilometragemLog(
        @NotNull
        Long veiculoId,

        @NotNull
        LocalDateTime dataHoraRegistro,

        @NotNull
        Integer quilometragemAnterior,

        @NotNull
        Integer quilometragemAtual,

        @NotBlank
        String origemAlteracao,

        Long idReferenciaOrigem
) {
}