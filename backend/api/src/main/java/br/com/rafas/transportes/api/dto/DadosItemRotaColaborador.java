/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record DadosItemRotaColaborador(
        Long id, // Opcional, para caso de edição de itens existentes
        @NotNull
        Long veiculoId,
        @NotNull
        Long motoristaId,
        @NotNull
        LocalTime horarioInicio,
        @NotNull
        LocalTime horarioFim
) {}