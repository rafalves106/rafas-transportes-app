/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List; // Importar List

public record DadosItemRotaColaborador(
        Long id, // Opcional, para caso de edição de itens existentes
        @NotNull
        Long veiculoId,
        @NotNull
        Long motoristaId,
        @NotNull // A lista de horários é obrigatória para cada item da rota
        List<DadosHorarioItemRota> horarios // <-- NOVO CAMPO: Lista de horários
) {}