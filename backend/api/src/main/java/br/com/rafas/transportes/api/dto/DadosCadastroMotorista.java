/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record DadosCadastroMotorista(
        @NotBlank
        String nome,

        @Future
        LocalDate validadeCnh,

        String telefone
) {
}