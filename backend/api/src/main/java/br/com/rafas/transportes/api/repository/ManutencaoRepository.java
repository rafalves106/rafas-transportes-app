package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Manutencao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    @Query("select m from Manutencao m where m.veiculo.id = :veiculoId")
    List<Manutencao> findByVeiculoId(Long veiculoId);
}