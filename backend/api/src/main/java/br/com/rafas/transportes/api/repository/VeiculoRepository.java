package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
}