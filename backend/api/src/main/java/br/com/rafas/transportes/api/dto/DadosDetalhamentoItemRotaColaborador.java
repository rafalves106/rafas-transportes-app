/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import br.com.rafas.transportes.api.domain.HorarioItemRota; // Importar HorarioItemRota
import java.time.LocalTime;
import java.util.List; // Importar List
import java.util.stream.Collectors; // Importar Collectors

public record DadosDetalhamentoItemRotaColaborador(
        Long id,
        Long veiculoId,
        String veiculoInfo, // Ex: "Modelo (Placa)"
        Long motoristaId,
        String motoristaNome, // Ex: "Nome do Motorista"
        // REMOVER: LocalTime horarioInicio, LocalTime horarioFim,
        List<DadosHorarioItemRota> horarios // <-- NOVO CAMPO: Lista de horários
) {
    public DadosDetalhamentoItemRotaColaborador(ItemRotaColaborador item) {
        this(
                item.getId(),
                item.getVeiculo() != null ? item.getVeiculo().getId() : null,
                item.getVeiculo() != null ? item.getVeiculo().getModel() + " (" + item.getVeiculo().getPlate() + ")" : "Veículo não informado",
                item.getMotorista() != null ? item.getMotorista().getId() : null,
                item.getMotorista() != null ? item.getMotorista().getNome() : "Motorista não definido",
                // REMOVER: item.getHorarioInicio(), item.getHorarioFim()
                item.getHorarios().stream() // Mapear a lista de horários
                        .map(DadosHorarioItemRota::new)
                        .collect(Collectors.toList())
        );
    }
}