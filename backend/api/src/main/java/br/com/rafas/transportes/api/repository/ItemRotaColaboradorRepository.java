package br.com.rafas.transportes.api.repository;

import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRotaColaboradorRepository extends JpaRepository<ItemRotaColaborador, Long> {
    // Métodos de busca customizados para ItemRotaColaborador podem ser adicionados aqui se necessário
    // Ex: findByVeiculoIdAndHorarioInicioBetween(Long veiculoId, LocalTime start, LocalTime end);
}