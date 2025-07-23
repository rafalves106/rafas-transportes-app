package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itens_rota_colaboradores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ItemRotaColaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id", nullable = false)
    private Viagem viagem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id", nullable = false)
    private Motorista motorista;

    @OneToMany(mappedBy = "itemRotaColaborador", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<HorarioItemRota> horarios = new ArrayList<>();

    public ItemRotaColaborador(Viagem viagem, Veiculo veiculo, Motorista motorista) {
        this.viagem = viagem;
        this.veiculo = veiculo;
        this.motorista = motorista;
        this.horarios = new ArrayList<>();
    }

    public void adicionarHorario(HorarioItemRota horario) {
        this.horarios.add(horario);
        horario.setItemRotaColaborador(this);
    }

    public void removerHorario(HorarioItemRota horario) {
        this.horarios.remove(horario);
        horario.setItemRotaColaborador(null);
    }
}