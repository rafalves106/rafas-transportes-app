package br.com.rafas.transportes.api.service;
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoViagem;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class ViagemService {
    @Autowired
    private ViagemRepository viagemRepository;
    @Autowired
    private VeiculoRepository veiculoRepository;
    @Autowired
    private MotoristaRepository motoristaRepository;
    @Transactional
    public DadosDetalhamentoViagem cadastrar(DadosCadastroViagem dados) {
        if (dados.veiculoId() == null) {
            throw new ValidationException("O ID do veículo é obrigatório para esta viagem.");
        }
        if (dados.motoristaId() == null) {
            throw new ValidationException("O ID do motorista é obrigatório para esta viagem.");
        }
        if (dados.startDate() == null) {
            throw new ValidationException("A data de início é obrigatória para esta viagem.");
        }
        if (dados.startTime() == null) {
            throw new ValidationException("A hora de início é obrigatória para esta viagem.");
        }
        if (dados.tipoViagem() == TipoViagem.IDA_E_VOLTA_MG ||
                dados.tipoViagem() == TipoViagem.IDA_E_VOLTA_FORA_MG ||
                dados.tipoViagem() == TipoViagem.FRETAMENTO_AEROPORTO) {
            if (dados.endDate() == null) {
                throw new ValidationException("A data de retorno é obrigatória para este tipo de viagem.");
            }
            if (dados.endTime() == null) {
                throw new ValidationException("A hora de retorno é obrigatória para este tipo de viagem.");
            }
        }
        Veiculo veiculoPrincipal = veiculoRepository.findById(dados.veiculoId())
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
        Motorista motoristaPrincipal = motoristaRepository.findById(dados.motoristaId())
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
        if (dados.startDate() != null && dados.startTime() != null &&
                dados.endDate() != null && dados.endTime() != null) {
            List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitosByTime(
                    veiculoPrincipal.getId(),
                    dados.startDate(),
                    dados.startTime(),
                    dados.endDate(),
                    dados.endTime(),
                    0L
            );
            if (!conflitosVeiculo.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O veículo principal já está em outra viagem neste período.");
            }
            List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitosByTime(
                    motoristaPrincipal.getId(),
                    dados.startDate(),
                    dados.startTime(),
                    dados.endDate(),
                    dados.endTime(),
                    0L
            );
            if (!conflitosMotorista.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O motorista principal já está em outra viagem neste período.");
            }
        } else if (dados.tipoViagem() != TipoViagem.SOMENTE_IDA_MG && dados.tipoViagem() != TipoViagem.SOMENTE_IDA_FORA_MG) {
            throw new ValidationException("Datas e horários de início/fim são obrigatórios para a validação de conflito para este tipo de viagem.");
        }
        var viagem = new Viagem(dados, veiculoPrincipal, motoristaPrincipal);
        viagemRepository.save(viagem);
        return new DadosDetalhamentoViagem(viagem);
    }
    @Transactional(readOnly = true)
    public List<DadosDetalhamentoViagem> listarTodas() {
        return viagemRepository.findAll().stream()
                .map(DadosDetalhamentoViagem::new)
                .collect(Collectors.toList());
    }
    @Transactional
    public DadosDetalhamentoViagem atualizar(Long id, DadosAtualizacaoViagem dados) {
        var viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Viagem não encontrada com o ID: " + id));
        TipoViagem tipoViagemValidar = dados.tipoViagem() != null ? dados.tipoViagem() : viagem.getTipoViagem();
        Veiculo veiculoAtualizado = null;
        Motorista motoristaAtualizado = null;
        if (dados.veiculoId() != null) {
            veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
                    .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
        } else {
            veiculoAtualizado = viagem.getVeiculo();
        }
        if (dados.motoristaId() != null) {
            motoristaAtualizado = motoristaRepository.findById(dados.motoristaId())
                    .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
        } else {
            motoristaAtualizado = viagem.getMotorista();
        }
        LocalDate dataInicioValidar = dados.startDate() != null ? dados.startDate() : viagem.getStartDate();
        LocalTime horaInicioValidar = dados.startTime() != null ? dados.startTime() : viagem.getStartTime();
        LocalDate dataFimValidar = dados.endDate() != null ? dados.endDate() : viagem.getEndDate();
        LocalTime horaFimValidar = dados.endTime() != null ? dados.endTime() : viagem.getEndTime();
        if (veiculoAtualizado != null && dataInicioValidar != null && horaInicioValidar != null && dataFimValidar != null && horaFimValidar != null) {
            List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitosByTime(
                    veiculoAtualizado.getId(),
                    dataInicioValidar,
                    horaInicioValidar,
                    dataFimValidar,
                    horaFimValidar,
                    id
            );
            if (!conflitosVeiculo.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O veículo principal já estará em outra viagem neste período após a atualização.");
            }
        }
        if (motoristaAtualizado != null && dataInicioValidar != null && horaInicioValidar != null && dataFimValidar != null && horaFimValidar != null) {
            List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitosByTime(
                    motoristaAtualizado.getId(),
                    dataInicioValidar,
                    horaInicioValidar,
                    dataFimValidar,
                    horaFimValidar,
                    id
            );
            if (!conflitosMotorista.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O motorista principal já estará em outra viagem neste período após a atualização.");
            }
        }
        viagem.atualizarInformacoes(dados, veiculoAtualizado, motoristaAtualizado);
        return new DadosDetalhamentoViagem(viagem);
    }
    @Transactional
    public void excluir(Long id) {
        if (!viagemRepository.existsById(id)) {
            throw new EntityNotFoundException("Viagem não encontrada com o ID: " + id);
        }
        viagemRepository.deleteById(id);
    }
}