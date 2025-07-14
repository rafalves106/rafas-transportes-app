package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    Optional<Viagem> findFirstByMotoristaId(Long motoristaId);

    Optional<Viagem> findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc(Long motoristaId, LocalDate endDate);

    @Query("select v from Viagem v where v.veiculo.id = :veiculoId")
    List<Viagem> findByVeiculo_Id(Long veiculoId);


    @Query("""
            select v from Viagem v
            where
            v.motorista.id = :motoristaId
            and v.endDate >= :startDate
            and v.startDate <= :endDate
            """)
    List<Viagem> findMotoristaConflitos(Long motoristaId, LocalDate startDate, LocalDate endDate);

    @Query("""
            select v from Viagem v
            where
            v.veiculo.id = :veiculoId
            and v.endDate >= :startDate
            and v.startDate <= :endDate
            """)
    List<Viagem> findVeiculoConflitos(Long veiculoId, LocalDate startDate, LocalDate endDate);
}