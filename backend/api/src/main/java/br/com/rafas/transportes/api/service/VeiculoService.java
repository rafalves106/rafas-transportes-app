package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Manutencao;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.veiculo.Veiculo;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroQuilometragemLog;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class VeiculoService {

    @Autowired
    private VeiculoRepository repository;

    @Autowired
    private ManutencaoRepository manutencaoRepository;

    @Autowired
    private ViagemRepository viagemRepository;

    @Autowired
    private QuilometragemLogService quilometragemLogService;

    @Transactional
    public Veiculo cadastrar(DadosCadastroVeiculo dados) {
        if (repository.existsByPlate(dados.plate())) {
            throw new ValidationException("Já existe um veículo cadastrado com esta placa: " + dados.plate());
        }
        var veiculo = new Veiculo(dados);

        repository.save(veiculo);

        quilometragemLogService.registrarLog(new DadosCadastroQuilometragemLog(
                veiculo.getId(),
                LocalDateTime.now(),
                0,
                veiculo.getCurrentKm(),
                "CADASTRO_INICIAL",
                null
        ));

        return veiculo;
    }

    @Transactional
    public Veiculo atualizar(Long id, DadosAtualizacaoVeiculo dados) {
        var veiculo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado"));

        if (dados.plate() != null && !dados.plate().equals(veiculo.getPlate())) {
            if (repository.existsByPlateAndIdNot(dados.plate(), id)) {
                throw new ValidationException("Já existe outro veículo cadastrado com esta placa: " + dados.plate());
            }
        }

        Integer quilometragemAnterior = veiculo.getCurrentKm();

        veiculo.atualizarInformacoes(dados);
        repository.save(veiculo);

        if (dados.currentKm() != null && !dados.currentKm().equals(quilometragemAnterior) && dados.currentKm() > quilometragemAnterior) {
            quilometragemLogService.registrarLog(new DadosCadastroQuilometragemLog(
                    veiculo.getId(),
                    LocalDateTime.now(),
                    quilometragemAnterior,
                    veiculo.getCurrentKm(),
                    "MANUAL",
                    null
            ));
        }

        return veiculo;
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Veículo não encontrado");
        }

        List<Manutencao> manutencoes = manutencaoRepository.findByVeiculoId(id);
        List<Viagem> viagens = viagemRepository.findByVeiculoId(id);

        if (!manutencoes.isEmpty() || !viagens.isEmpty()) {
            StringBuilder erro = new StringBuilder("Este veículo não pode ser excluído, pois possui pendências:");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            if (!manutencoes.isEmpty()) {
                Manutencao manutencao = manutencoes.get(0);
                erro.append(String.format(
                        " Manutenção '%s' agendada para %s.",
                        manutencao.getTitle(),
                        manutencao.getDate() != null ? manutencao.getDate().format(formatter) : "data não informada"
                ));
            }

            if (!viagens.isEmpty()) {
                Viagem viagem = viagens.get(0);
                erro.append(String.format(
                        " Viagem '%s' para o cliente %s na data de %s.",
                        viagem.getTitle(),
                        viagem.getClientName(),
                        viagem.getStartDate() != null ? viagem.getStartDate().format(formatter) : "data não informada"
                ));
            }

            throw new ValidationException(erro.toString());
        }

        repository.deleteById(id);
    }
}