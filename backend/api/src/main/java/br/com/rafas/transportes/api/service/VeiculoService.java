package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Manutencao;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroVeiculo;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Veiculo cadastrar(DadosCadastroVeiculo dados) {
        if (repository.existsByPlate(dados.plate())) {
            throw new ValidationException("Placa já cadastrada no sistema.");
        }
        var veiculo = new Veiculo(dados);
        repository.save(veiculo);
        return veiculo;
    }

    public Veiculo atualizar(Long id, DadosAtualizacaoVeiculo dados) {
        var veiculo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado"));
        veiculo.atualizarInformacoes(dados);
        return veiculo;
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Veículo não encontrado");
        }

        List<Manutencao> manutenções = manutencaoRepository.findByVeiculoId(id);
        List<Viagem> viagens = viagemRepository.findByVeiculoId(id);

        if (!manutenções.isEmpty() || !viagens.isEmpty()) {
            StringBuilder erro = new StringBuilder("Este veículo não pode ser excluído, pois possui pendências:");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            if (!manutenções.isEmpty()) {
                Manutencao manutencao = manutenções.get(0);
                erro.append(String.format(
                        " Manutenção '%s' agendada para %s.",
                        manutencao.getTitle(),
                        manutencao.getDate().format(formatter)
                ));
            }

            if (!viagens.isEmpty()) {
                Viagem viagem = viagens.get(0);
                erro.append(String.format(
                        " Viagem '%s' para o cliente %s na data de %s.",
                        viagem.getTitle(),
                        viagem.getClientName(),
                        viagem.getStartDate().format(formatter)
                ));
            }

            throw new ValidationException(erro.toString());
        }

        repository.deleteById(id);
    }
}