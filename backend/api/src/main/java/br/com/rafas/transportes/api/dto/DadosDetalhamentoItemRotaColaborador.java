/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import java.time.LocalTime;

public record DadosDetalhamentoItemRotaColaborador(
        Long id,
        Long veiculoId,
        String veiculoInfo, // Ex: "Modelo (Placa)"
        Long motoristaId,
        String motoristaNome, // Ex: "Nome do Motorista"
        LocalTime horarioInicio,
        LocalTime horarioFim
) {
    public DadosDetalhamentoItemRotaColaborador(ItemRotaColaborador item) {
        this(
                item.getId(),
                item.getVeiculo() != null ? item.getVeiculo().getId() : null,
                item.getVeiculo() != null ? item.getVeiculo().getModel() + " (" + item.getVeiculo().getPlate() + ")" : "Veículo não informado",
                item.getMotorista() != null ? item.getMotorista().getId() : null,
                item.getMotorista() != null ? item.getMotorista().getNome() : "Motorista não definido",
                item.getHorarioInicio(),
                item.getHorarioFim()
        );
    }
}