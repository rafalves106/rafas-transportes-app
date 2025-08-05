package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.veiculo.log.QuilometragemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuilometragemLogRepository extends JpaRepository<QuilometragemLog, Long> {

    List<QuilometragemLog> findByVeiculoIdOrderByDataHoraRegistroAsc(Long veiculoId);

    void deleteAllByVeiculoId(Long veiculoId);

}