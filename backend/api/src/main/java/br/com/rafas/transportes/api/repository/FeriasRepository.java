package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Ferias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeriasRepository extends JpaRepository<Ferias, Long> {

    List<Ferias> findByMotoristaId(Long motoristaId);

    @Query("SELECT COUNT(f) > 0 FROM Ferias f WHERE f.motorista.id = :motoristaId " +
            "AND (:dataInicio BETWEEN f.dataInicio AND f.dataFim OR " +
            ":dataFim BETWEEN f.dataInicio AND f.dataFim OR " +
            "(f.dataInicio BETWEEN :dataInicio AND :dataFim AND f.dataFim BETWEEN :dataInicio AND :dataFim))")
    boolean existeConflitoDeFerias(@Param("motoristaId") Long motoristaId,
                                   @Param("dataInicio") LocalDate dataInicio,
                                   @Param("dataFim") LocalDate dataFim);
}