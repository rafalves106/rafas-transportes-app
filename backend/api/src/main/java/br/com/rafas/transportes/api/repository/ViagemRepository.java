package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    @Query("SELECT v FROM Viagem v JOIN v.motoristas m WHERE m.id = :motoristaId")
    List<Viagem> findByMotoristaId(Long motoristaId);

    @Query("SELECT v FROM Viagem v JOIN v.veiculos ve WHERE ve.id = :veiculoId")
    List<Viagem> findByVeiculoId(Long veiculoId);

    @Query("""
            SELECT v FROM Viagem v
            JOIN v.motoristas m
            WHERE m.id IN :motoristaIds
            AND v.endDate >= :startDate AND v.startDate <= :endDate
            """)
    List<Viagem> findMotoristaConflitos(List<Long> motoristaIds, LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT v FROM Viagem v
            JOIN v.veiculos ve
            WHERE ve.id IN :veiculoIds
            AND v.endDate >= :startDate AND v.startDate <= :endDate
            """)
    List<Viagem> findVeiculoConflitos(List<Long> veiculoIds, LocalDate startDate, LocalDate endDate);
}