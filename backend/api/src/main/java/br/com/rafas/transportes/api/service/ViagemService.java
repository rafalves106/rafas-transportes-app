/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.*;
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

@Service
public class ViagemService {

    @Autowired
    private ViagemRepository viagemRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private MotoristaRepository motoristaRepository;

    public Viagem cadastrar(DadosCadastroViagem dados) {
        Veiculo veiculo = veiculoRepository.findById(dados.veiculoId())
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado"));

        Motorista motorista = motoristaRepository.findById(dados.motoristaId())
                .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado"));

        var conflitosMotorista = viagemRepository.findMotoristaConflitos(dados.motoristaId(), dados.startDate(), dados.endDate());
        if (!conflitosMotorista.isEmpty()) {
            throw new ValidationException("Conflito de agendamento: O motorista já está em outra viagem neste período.");
        }

        var conflitosVeiculo = viagemRepository.findVeiculoConflitos(dados.veiculoId(), dados.startDate(), dados.endDate());
        if (!conflitosVeiculo.isEmpty()) {
            throw new ValidationException("Conflito de agendamento: O veículo já está em outra viagem neste período.");
        }

        if (dados.startDate() != null && dados.endDate() != null) {
            if (dados.endDate().isBefore(dados.startDate())) {
                throw new ValidationException("Data de retorno não pode ser anterior à data de saída.");
            }
        }

        var viagem = new Viagem();
        viagem.setTitle(dados.title());
        viagem.setClientName(dados.clientName());
        viagem.setTelefone(dados.telefone());
        viagem.setValor(dados.valor());
        viagem.setStartLocation(dados.startLocation());
        viagem.setEndLocation(dados.endLocation());
        viagem.setVeiculo(veiculo);
        viagem.setMotorista(motorista);
        viagem.setStartDate(dados.startDate());
        viagem.setStartTime(dados.startTime());
        viagem.setEndDate(dados.endDate());
        viagem.setEndTime(dados.endTime());
        viagem.setStatus(StatusViagem.AGENDADA);
        viagem.setTipoViagem(dados.tipo() != null ? dados.tipo() : TipoViagem.IDA_E_VOLTA_MG);

        viagemRepository.save(viagem);

        return viagem;
    }

    @Transactional(readOnly = true)
    public List<DadosDetalhamentoViagem> listarTodas() {
        return viagemRepository.findAll().stream()
                .map(DadosDetalhamentoViagem::new)
                .toList();
    }

    public Viagem atualizar(Long id, DadosAtualizacaoViagem dados) {
        var viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Viagem não encontrada"));

        LocalDate startDate = dados.startDate() != null ? dados.startDate() : viagem.getStartDate();
        LocalDate endDate = dados.endDate() != null ? dados.endDate() : viagem.getEndDate();

        if (startDate != null && endDate != null) {
            if (endDate.isBefore(startDate)) {
                throw new ValidationException("Data de retorno não pode ser anterior à data de saída.");
            }
        }

        if (dados.title() != null) viagem.setTitle(dados.title());
        if (dados.clientName() != null) viagem.setClientName(dados.clientName());
        if (dados.telefone() != null) viagem.setTelefone(dados.telefone());
        if (dados.valor() != null) {
            viagem.setValor(dados.valor());
        }
        if (dados.startLocation() != null) viagem.setStartLocation(dados.startLocation());
        if (dados.endLocation() != null) viagem.setEndLocation(dados.endLocation());
        if (dados.startDate() != null) viagem.setStartDate(dados.startDate());
        if (dados.startTime() != null) viagem.setStartTime(dados.startTime());
        if (dados.endDate() != null) viagem.setEndDate(dados.endDate());
        if (dados.endTime() != null) viagem.setEndTime(dados.endTime());
        if (dados.status() != null) viagem.setStatus(dados.status());
        if (dados.tipo() != null) viagem.setTipoViagem(dados.tipo());

        if (dados.veiculoId() != null) {
            var veiculo = veiculoRepository.findById(dados.veiculoId()).orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado"));
            viagem.setVeiculo(veiculo);
        }
        if (dados.motoristaId() != null) {
            var motorista = motoristaRepository.findById(dados.motoristaId()).orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado"));
            viagem.setMotorista(motorista);
        }

        return viagem;
    }

    public void excluir(Long id) {
        if (!viagemRepository.existsById(id)) {
            throw new EntityNotFoundException("Viagem não encontrada");
        }
        viagemRepository.deleteById(id);
    }
}