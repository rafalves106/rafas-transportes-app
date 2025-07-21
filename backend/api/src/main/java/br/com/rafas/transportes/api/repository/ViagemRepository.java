package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    Optional<Viagem> findFirstByMotoristaId(Long motoristaId); // Para a exclusão
    Optional<Viagem> findFirstByMotoristaIdAndEndDateGreaterThanOrderByEndDateAsc(Long motoristaId, LocalDate endDate); // Para a validação da CNH
    List<Viagem> findByMotoristaId(Long motoristaId); // Para listar todas as viagens de um motorista (utilizado na exclusão)


    @Query("select v from Viagem v where v.veiculo.id = :veiculoId")
    List<Viagem> findByVeiculoId(Long veiculoId);

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

    @Query("""
            SELECT v FROM Viagem v
            WHERE
                (v.veiculo.id = :veiculoId OR :veiculoId IS NULL)
                AND v.tipoViagem != 'ROTA_COLABORADORES'
                AND v.startDate <= :endDate
                AND v.endDate >= :startDate
                AND (
                    (v.startTime <= :endTime AND v.endTime >= :startTime)
                    OR (v.startDate < :endDate AND v.endDate > :startDate)
                )
                AND v.id != :viagemIdToExclude
            """)
    List<Viagem> findVeiculoConflitosByTime(
            Long veiculoId,
            LocalDate startDate,
            LocalTime startTime,
            LocalDate endDate,
            LocalTime endTime,
            Long viagemIdToExclude
    );

    @Query("""
        SELECT v FROM Viagem v
        WHERE
            (v.motorista.id = :motoristaId OR :motoristaId IS NULL) -- Conflito com motorista principal da viagem OU com o ID do motorista do item da rota (se o motorista principal for nulo)
            AND v.tipoViagem != 'ROTA_COLABORADORES' -- Exclui outras rotas por enquanto
            AND v.startDate <= :endDate
            AND v.endDate >= :startDate
            AND (
                (v.startTime <= :endTime AND v.endTime >= :startTime)
                OR (v.startDate < :endDate AND v.endDate > :startDate)
            )
            AND v.id != :viagemIdToExclude -- Exclui a própria viagem em caso de atualização
        """)
    List<Viagem> findMotoristaConflitosByTime(
            Long motoristaId,
            LocalDate startDate,
            LocalTime startTime,
            LocalDate endDate,
            LocalTime endTime,
            Long viagemIdToExclude
    );

}