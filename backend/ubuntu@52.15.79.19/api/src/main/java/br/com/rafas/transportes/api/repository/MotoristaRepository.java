package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MotoristaRepository extends JpaRepository<Motorista, Long> {

    boolean existsByNome(String nome);
    boolean existsByTelefone(String telefone);

    boolean existsByTelefoneAndIdNot(String telefone, Long id);

}