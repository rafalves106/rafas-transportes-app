/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.veiculo.log.QuilometragemLog;
import br.com.rafas.transportes.api.domain.veiculo.Veiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroQuilometragemLog;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoQuilometragemLog;
import br.com.rafas.transportes.api.repository.QuilometragemLogRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuilometragemLogService {

    @Autowired
    private QuilometragemLogRepository quilometragemLogRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Transactional
    public DadosDetalhamentoQuilometragemLog registrarLog(DadosCadastroQuilometragemLog dados) {
        Veiculo veiculo = veiculoRepository.findById(dados.veiculoId())
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para registrar log de quilometragem com o ID: " + dados.veiculoId()));

        QuilometragemLog log = new QuilometragemLog(
                null,
                veiculo,
                dados.dataHoraRegistro(),
                dados.quilometragemAnterior(),
                dados.quilometragemAtual(),
                dados.origemAlteracao(),
                dados.idReferenciaOrigem()
        );

        quilometragemLogRepository.save(log);
        return new DadosDetalhamentoQuilometragemLog(log);
    }

    @Transactional(readOnly = true)
    public List<DadosDetalhamentoQuilometragemLog> listarLogsPorVeiculo(Long veiculoId) {
        if (!veiculoRepository.existsById(veiculoId)) {
            throw new EntityNotFoundException("Veículo não encontrado para listar logs de quilometragem com o ID: " + veiculoId);
        }

        List<QuilometragemLog> logs = quilometragemLogRepository.findAll().stream()
                .filter(log -> log.getVeiculo().getId().equals(veiculoId))
                .collect(Collectors.toList());

        logs.sort((log1, log2) -> log1.getDataHoraRegistro().compareTo(log2.getDataHoraRegistro()));


        return logs.stream()
                .map(DadosDetalhamentoQuilometragemLog::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void excluirLogsPorVeiculo(Long veiculoId) {
        if (!veiculoRepository.existsById(veiculoId)) {
            throw new ValidationException("Veículo não encontrado.");
        }
        quilometragemLogRepository.deleteAllByVeiculoId(veiculoId);
    }
}