/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusMotorista;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DadosAtualizacaoMotorista(
        @NotBlank
        String nome,
        @NotBlank
        String telefone,
        @Future
        LocalDate validadeCnh,
        @NotNull
        StatusMotorista status
) {
}