package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    boolean existsByPlate(String plate);
}