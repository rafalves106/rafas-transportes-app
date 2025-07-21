package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.domain.Viagem;
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
        // Validação de IDs de Veículo e Motorista (se não for feita no DTO com @NotNull)
        if (dados.veiculoId() == null) {
            throw new ValidationException("O ID do veículo é obrigatório.");
        }
        if (dados.motoristaId() == null) {
            throw new ValidationException("O ID do motorista é obrigatório.");
        }

        var veiculo = veiculoRepository.findById(dados.veiculoId())
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));

        var motorista = motoristaRepository.findById(dados.motoristaId())
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));

        // Validações de Conflito de Agendamento
        var conflitosMotorista = viagemRepository.findMotoristaConflitos(dados.motoristaId(), dados.startDate(), dados.endDate());
        if (!conflitosMotorista.isEmpty()) {
            throw new ValidationException("Conflito de agendamento: O motorista já está em outra viagem neste período.");
        }

        var conflitosVeiculo = viagemRepository.findVeiculoConflitos(dados.veiculoId(), dados.startDate(), dados.endDate());
        if (!conflitosVeiculo.isEmpty()) {
            throw new ValidationException("Conflito de agendamento: O veículo já está em outra viagem neste período.");
        }

        // Cria a entidade usando o novo construtor
        var viagem = new Viagem(dados, veiculo, motorista);

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

        // Busca as entidades relacionadas APENAS se os IDs forem fornecidos nos dados
        Veiculo veiculoAtualizado = null;
        if (dados.veiculoId() != null) {
            veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
                    .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
        }

        Motorista motoristaAtualizado = null;
        if (dados.motoristaId() != null) {
            motoristaAtualizado = motoristaRepository.findById(dados.motoristaId())
                    .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
        }

        // Validações de Conflito de Agendamento (para a data/veículo/motorista ATUALIZADOS)
        // Cuidado: Se o ID do motorista/veículo não mudou, você precisa excluir a própria viagem da validação de conflito
        // Isso requer uma query mais complexa ou uma lógica no service para ignorar a própria viagem
        // Por simplicidade, para este escopo, vamos assumir que as datas/horas serão testadas para o motorista/veículo 'alvo'

        // Exemplo de validação de conflito de datas/horários após atualização
        if ((dados.startDate() != null && dados.endDate() != null) || (dados.veiculoId() != null || dados.motoristaId() != null)) {
            // Se as datas ou os recursos (veiculo/motorista) mudaram, revalida o conflito
            LocalDate dataInicioValidar = dados.startDate() != null ? dados.startDate() : viagem.getStartDate();
            LocalDate dataFimValidar = dados.endDate() != null ? dados.endDate() : viagem.getEndDate();
            Long motoristaIdValidar = motoristaAtualizado != null ? motoristaAtualizado.getId() : viagem.getMotorista().getId();
            Long veiculoIdValidar = veiculoAtualizado != null ? veiculoAtualizado.getId() : viagem.getVeiculo().getId();

            // Lógica para excluir a própria viagem dos conflitos (JPQL mais complexo)
            List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitos(motoristaIdValidar, dataInicioValidar, dataFimValidar);
            conflitosMotorista.removeIf(v -> v.getId().equals(viagem.getId())); // Ignora a própria viagem
            if (!conflitosMotorista.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O motorista já estará em outra viagem neste período após a atualização.");
            }

            List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitos(veiculoIdValidar, dataInicioValidar, dataFimValidar);
            conflitosVeiculo.removeIf(v -> v.getId().equals(viagem.getId())); // Ignora a própria viagem
            if (!conflitosVeiculo.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O veículo já estará em outra viagem neste período após a atualização.");
            }
        }

        // Chama o método da entidade para atualizar as informações
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