package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MotoristaRepository extends JpaRepository<Motorista, Long> {

    boolean existsByCpf(String cpf);
    boolean existsByCnh(String cnh);

}