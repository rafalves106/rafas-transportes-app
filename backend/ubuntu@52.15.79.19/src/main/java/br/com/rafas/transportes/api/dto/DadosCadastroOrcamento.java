/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DadosCadastroOrcamento(
        @NotBlank
        String nomeCliente,
        String telefone,
        @NotBlank
        String origem,
        @NotBlank
        String destino,
        @NotBlank
        String distancia,

        String paradas,

        @NotNull
        BigDecimal valorTotal,

        String tipoViagemOrcamento,
        String descricaoIdaOrcamento,
        String descricaoVoltaOrcamento

) {
}