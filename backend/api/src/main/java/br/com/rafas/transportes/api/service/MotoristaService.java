package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.StatusMotorista;
import br.com.rafas.transportes.api.domain.Viagem; // Certifique-se de que está importada
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
// import java.util.Optional; // Optional não será mais necessário aqui para findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc, pois usaremos findMotoristaConflitos
import java.util.stream.Collectors; // Certifique-se de que está importado

@Service
public class MotoristaService {

  @Autowired
  private MotoristaRepository repository;

  @Autowired
  private ViagemRepository viagemRepository; // Uma única injeção é suficiente.

  @Transactional
  public Motorista cadastrar(DadosCadastroMotorista dados) {
    if (repository.existsByNome(dados.nome())) {
      throw new ValidationException("Nome já cadastrado no sistema.");
    }

    if (repository.existsByTelefone(dados.telefone())) {
      throw new ValidationException("Telefone já cadastrado no sistema.");
    }

    // Alinhando com o encapsulamento da entidade Motorista:
    // A entidade Motorista.java precisa ter um construtor que aceita DadosCadastroMotorista
    // public Motorista(DadosCadastroMotorista dados) { ... }
    var motorista = new Motorista(dados); // Usa o construtor do Motorista

    repository.save(motorista);
    // repository.flush(); // Geralmente não é necessário chamar flush explicitamente aqui

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

    if (dados.validadeCnh() != null) {
      LocalDate novaValidadeCnh = dados.validadeCnh();

      // **NOVA LÓGICA DE VALIDAÇÃO DE CONFLITO PARA CNH:**
      // Usaremos findMotoristaConflitos para verificar se há alguma viagem
      // cuja data final ultrapasse a nova validade da CNH.
      // Assumimos que findMotoristaConflitos(id, startDate, endDate) existe e funciona.
      // Precisamos de uma data de início que seja 'hoje' ou 'agora' para verificar conflitos futuros.
      // Ou, mais especificamente, buscar viagens que TERMINEM *após* a nova validade.
      // Seu findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc é melhor para isso,
      // se ele estiver no repositório. Vamos restaurá-lo ou usar findMotoristaConflitos de forma adaptada.

      // Opção 1: Se findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc existe e foi mantido no ViagemRepository
      // var viagemFuturaOptional = viagemRepository.findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc(id, novaValidadeCnh);

      // Opção 2: Adaptar findMotoristaConflitos (mais geral, mas pode ser menos performático para o caso exato)
      // Para encontrar viagens que terminam APÓS a nova validade da CNH, podemos buscar
      // conflitos desde a nova validade até uma data futura distante (ex: 100 anos).
      // Isso é menos ideal que um método específico de repo.
      // MELHOR: RESTAURAR findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc NO REPOSITÓRIO.

      // ASSUMINDO QUE findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc FOI RESTAURADO EM ViagemRepository:
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

    // Alinhando com o encapsulamento da entidade Motorista:
    // A entidade Motorista.java precisa ter um método 'atualizarInformacoes(DadosAtualizacaoMotorista dados)'
    motorista.atualizarInformacoes(dados); // Usa o método da entidade

    return motorista;
  }

  @Transactional
  public void excluir(Long id) {
    if (!repository.existsById(id)) {
      throw new EntityNotFoundException("Motorista não encontrado");
    }

    // **NOVA LÓGICA DE VALIDAÇÃO DE EXCLUSÃO:**
    // Usaremos findFirstByMotoristaId(Long motoristaId) se ele existe e foi mantido no ViagemRepository,
    // ou findMotoristaConflitos para verificar qualquer viagem associada.
    // A query findByMotoristaId(Long motoristaId) que você tinha no seu código original
    // (com @Query("select v from Viagem v where v.motorista.id = :motoristaId"))
    // é a mais direta para listar todas as viagens de um motorista.
    // Vamos garantir que essa query esteja no ViagemRepository e que o método que a chama seja findByMotoristaId.

    // A versão que você colou aqui já usa findByMotoristaId(id), o que é ótimo.
    // Se ViagemRepository não tiver findByMotoristaId(Long), adicione-o com a @Query.
    List<Viagem> viagensAssociadas = viagemRepository.findByMotoristaId(id);


    if (!viagensAssociadas.isEmpty()) {
      Viagem viagemExemplo = viagensAssociadas.get(0); // Pega a primeira para dar o exemplo
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