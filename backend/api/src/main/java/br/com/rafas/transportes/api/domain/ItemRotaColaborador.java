/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // Adicionar @Setter para facilitar a atualização via DTO, ou métodos específicos de atualização.

import java.time.LocalTime;

@Entity
@Table(name = "itens_rota_colaboradores") // Nome da tabela no banco de dados
@Getter
@Setter // Considerar adicionar para facilitar o mapeamento de DTO para entidade
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ItemRotaColaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referência à Viagem principal (muitos itens de rota para uma viagem)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id", nullable = false)
    private Viagem viagem;

    // O veículo específico para este item da rota
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    // O motorista específico para este item da rota
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id", nullable = false)
    private Motorista motorista;

    // Horários específicos para este veículo/motorista na rota
    @Column(nullable = false)
    private LocalTime horarioInicio;

    @Column(nullable = false)
    private LocalTime horarioFim;

    // Construtor para facilitar a criação a partir de um DTO (que criaremos depois)
    public ItemRotaColaborador(Viagem viagem, Veiculo veiculo, Motorista motorista, LocalTime horarioInicio, LocalTime horarioFim) {
        this.viagem = viagem;
        this.veiculo = veiculo;
        this.motorista = motorista;
        this.horarioInicio = horarioInicio;
        this.horarioFim = horarioFim;
    }
}