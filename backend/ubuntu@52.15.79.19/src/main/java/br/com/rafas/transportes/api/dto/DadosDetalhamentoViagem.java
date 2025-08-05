package br.com.rafas.transportes.api.dto;
import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import br.com.rafas.transportes.api.domain.Viagem;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
public record DadosDetalhamentoViagem(
        Long id,
        String title,
        String clientName,
        String telefone,
        BigDecimal valor,
        String startLocation,
        String endLocation,
        Long veiculoId,
        String veiculoInfo,
        Long motoristaId,
        String motoristaNome,
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status,
        TipoViagem tipoViagem
) {
    public DadosDetalhamentoViagem(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getTitle(),
                viagem.getClientName(),
                viagem.getTelefone(),
                viagem.getValor(),
                viagem.getStartLocation(),
                viagem.getEndLocation(),
                viagem.getVeiculo() != null ? viagem.getVeiculo().getId() : null,
                viagem.getVeiculo() != null ? viagem.getVeiculo().getModel() + " (" + viagem.getVeiculo().getPlate() + ")" : "Veículo não informado",
                viagem.getMotorista() != null ? viagem.getMotorista().getId() : null,
                viagem.getMotorista() != null ? viagem.getMotorista().getNome() : "Motorista não definido",
                viagem.getStartDate(),
                viagem.getStartTime(),
                viagem.getEndDate(),
                viagem.getEndTime(),
                viagem.getStatus(),
                viagem.getTipoViagem()
        );
    }
}