/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoMotorista;
import br.com.rafas.transportes.api.dto.DadosCadastroMotorista;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoMotorista;
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.StatusMotorista;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class MotoristaService {

  @Autowired
  private MotoristaRepository repository;

  public Motorista cadastrar(DadosCadastroMotorista dados) {
    if (repository.existsByCpf(dados.cpf())) {
      throw new ValidationException("CPF já cadastrado no sistema.");
    }

    if (repository.existsByCnh(dados.cnh())) {
      throw new ValidationException("CNH já cadastrada no sistema.");
    }

    var motorista = new Motorista();
    motorista.setNome(dados.nome());
    motorista.setCpf(dados.cpf());
    motorista.setCnh(dados.cnh());
    motorista.setValidadeCnh(dados.validadeCnh());
    motorista.setTelefone(dados.telefone());
    motorista.setStatus(StatusMotorista.ATIVO);

    repository.save(motorista);
    repository.flush();

    return motorista;
  }

  public List<DadosDetalhamentoMotorista> listarTodos() {
    return repository.findAll().stream()
            .map(DadosDetalhamentoMotorista::new)
            .toList();
  }

  public Motorista atualizar(Long id, DadosAtualizacaoMotorista dados) {
    var motorista = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado"));

    if (dados.validadeCnh() != null) {
      LocalDate novaValidadeCnh = dados.validadeCnh();

      var viagemFuturaOptional = viagemRepository
              .findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc(id, novaValidadeCnh);

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

    if (dados.nome() != null) {
      motorista.setNome(dados.nome());
    }
    if (dados.telefone() != null) {
      motorista.setTelefone(dados.telefone());
    }
    if (dados.cpf() != null) {
      motorista.setCpf(dados.cpf());
    }
    if (dados.cnh() != null) {
      motorista.setCnh(dados.cnh());
    }
    if (dados.validadeCnh() != null) {
      motorista.setValidadeCnh(dados.validadeCnh());
    }
    if (dados.status() != null) {
      motorista.setStatus(dados.status());
    }

    return motorista;
  }

  @Autowired
  private ViagemRepository viagemRepository;

  public void excluir(Long id) {
    if (!repository.existsById(id)) {
      throw new EntityNotFoundException("Motorista não encontrado");
    }

    Optional<Viagem> primeiraViagemOptional = viagemRepository.findFirstByMotoristaId(id);

    if (primeiraViagemOptional.isPresent()) {
      Viagem viagem = primeiraViagemOptional.get();
      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
      LocalDate dataViagem = viagem.getStartDate();

      String mensagemDeErro = String.format(
              "Este motorista não pode ser excluído. Ele está associado à viagem '%s' na data de %s.",
              viagem.getTitle(),
              dataViagem.format(formatter)
      );

      throw new ValidationException(mensagemDeErro);
    }

    repository.deleteById(id);
  }
}