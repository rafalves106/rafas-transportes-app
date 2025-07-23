package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "viagens")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Motorista motorista;

    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusViagem status;

    private String clientName;
    private String telefone;
    private BigDecimal valor;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String startLocation;

    @Column(columnDefinition = "TEXT")
    private String endLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoViagem tipoViagem;

    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemRotaColaborador> itensRota = new ArrayList<>();

    // --- CONSTRUTOR PARA CADASTRO ---
    // Agora o construtor da Viagem principal não precisa mais receber horários diretos,
    // pois eles estarão nos ItemRotaColaborador.
    public Viagem(DadosCadastroViagem dados, Veiculo veiculo, Motorista motorista) {
        this.title = dados.title();
        this.clientName = dados.clientName();
        this.telefone = dados.telefone();
        this.valor = dados.valor();
        this.startLocation = dados.startLocation();
        this.endLocation = dados.endLocation();
        this.startDate = dados.startDate(); // Manter, pois ainda define o período geral da viagem
        this.startTime = dados.startTime(); // Manter
        this.endDate = dados.endDate();     // Manter
        this.endTime = dados.endTime();     // Manter
        this.status = StatusViagem.AGENDADA;
        this.tipoViagem = dados.tipoViagem();

        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            this.veiculo = veiculo;
            this.motorista = motorista;
        } else {
            this.veiculo = null;
            this.motorista = null;
        }

        this.itensRota = new ArrayList<>(); // A lista é inicializada, mas preenchida no serviço
    }

    // --- MÉTODO DE ATUALIZAÇÃO DE INFORMAÇÕES ---
    // Adaptação para refletir que horários e itens de rota são gerenciados via itensRota
    public void atualizarInformacoes(DadosAtualizacaoViagem dados, Veiculo veiculoAtualizado, Motorista motoristaAtualizado) {
        if (dados.title() != null) {
            this.title = dados.title();
        }
        if (dados.clientName() != null) {
            this.clientName = dados.clientName();
        }
        if (dados.telefone() != null) {
            this.telefone = dados.telefone();
        }
        if (dados.valor() != null) {
            this.valor = dados.valor();
        }
        if (dados.startLocation() != null) {
            this.startLocation = dados.startLocation();
        }
        if (dados.endLocation() != null) {
            this.endLocation = dados.endLocation();
        }
        if (dados.startDate() != null) {
            this.startDate = dados.startDate();
        }
        if (dados.startTime() != null) {
            this.startTime = dados.startTime();
        }
        if (dados.endDate() != null) {
            this.endDate = dados.endDate();
        }
        if (dados.endTime() != null) {
            this.endTime = dados.endTime();
        }
        if (dados.status() != null) {
            this.status = dados.status();
        }
        if (dados.tipoViagem() != null) {
            this.tipoViagem = dados.tipoViagem();

            if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES) {
                this.veiculo = null;
                this.motorista = null;
            }
        }

        if (this.tipoViagem != TipoViagem.ROTA_COLABORADORES) {
            if (veiculoAtualizado != null) {
                this.veiculo = veiculoAtualizado;
            }
            if (motoristaAtualizado != null) {
                this.motorista = motoristaAtualizado;
            }
        }

        // A lógica para atualizar 'itensRota' (que inclui horários)
        // será tratada no serviço, geralmente limpando e adicionando.
        // O método 'atualizarInformacoes' da entidade foca nos campos diretos da Viagem.
    }

    public void adicionarItemRota(ItemRotaColaborador item) {
        this.itensRota.add(item);
        item.setViagem(this);
    }

    public void removerItemRota(ItemRotaColaborador item) {
        this.itensRota.remove(item);
        item.setViagem(null);
    }
}