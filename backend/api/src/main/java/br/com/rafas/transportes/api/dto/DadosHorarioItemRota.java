/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.HorarioItemRota;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record DadosHorarioItemRota(
        Long id, // Opcional, para caso de edição
        @NotNull
        LocalTime inicio,
        @NotNull
        LocalTime fim
) {

    public DadosHorarioItemRota(HorarioItemRota horario) {
        this(horario.getId(), horario.getInicio(), horario.getFim());
    }
}