package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoMotorista;
import br.com.rafas.transportes.api.dto.DadosCadastroMotorista;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoMotorista;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MotoristaService {

  @Autowired
  private MotoristaRepository repository;

  @Autowired
  private ViagemRepository viagemRepository;

  @Transactional
  public Motorista cadastrar(DadosCadastroMotorista dados) {
    if (repository.existsByNome(dados.nome())) {
      throw new ValidationException("Nome já cadastrado no sistema.");
    }

    if (repository.existsByTelefone(dados.telefone())) {
      throw new ValidationException("Telefone já cadastrado no sistema.");
    }

    var motorista = new Motorista(dados);
    repository.save(motorista);
    return motorista;
  }

  public List<DadosDetalhamentoMotorista> listarTodos() {
    return repository.findAll().stream()
            .map(DadosDetalhamentoMotorista::new)
            .toList();
  }

  @Transactional
  public Motorista atualizar(Long id, DadosAtualizacaoMotorista dados) {
    var motorista = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado"));

    if (dados.telefone() != null && !dados.telefone().equals(motorista.getTelefone())) {
      if (repository.existsByTelefoneAndIdNot(dados.telefone(), id)) {
        throw new ValidationException("O novo telefone já está cadastrado para outro motorista.");
      }
    }

    if (dados.validadeCnh() != null) {
      LocalDate novaValidadeCnh = dados.validadeCnh();

      var viagemFuturaOptional = viagemRepository.findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc(id, novaValidadeCnh);

      if (viagemFuturaOptional.isPresent()) {
        Viagem viagemConflitante = viagemFuturaOptional.get();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate dataFimViagem = viagemConflitante.getEndDate();

        String mensagem = String.format(
                "A validade da CNH não pode expirar durante uma viagem. Conflito com a viagem '%s' que termina em %s.",
                viagemConflitante.getTitle(),
                dataFimViagem.format(formatter)
        );
        throw new ValidationException(mensagem);
      }
    }

    motorista.atualizarInformacoes(dados);

    return motorista;
  }

  @Transactional
  public void excluir(Long id) {
    if (!repository.existsById(id)) {
      throw new EntityNotFoundException("Motorista não encontrado");
    }

    List<Viagem> viagensAssociadas = viagemRepository.findByMotoristaId(id);

    if (!viagensAssociadas.isEmpty()) {
      Viagem viagemExemplo = viagensAssociadas.get(0);
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
      LocalDate dataViagem = viagemExemplo.getStartDate();

      String mensagemDeErro = String.format(
              "Este motorista não pode ser excluído. Ele está associado à viagem '%s' na data de %s (e possivelmente outras).",
              viagemExemplo.getTitle(),
              dataViagem.format(formatter)
      );

      throw new ValidationException(mensagemDeErro);
    }

    repository.deleteById(id);
  }
}