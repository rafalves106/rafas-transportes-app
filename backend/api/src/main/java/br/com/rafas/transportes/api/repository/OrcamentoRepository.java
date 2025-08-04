package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {

    List<Orcamento> findByDataDoOrcamentoBefore(LocalDate dataLimite);
}