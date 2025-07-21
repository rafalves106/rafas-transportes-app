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
import java.util.ArrayList; // Importar ArrayList
import java.util.List; // Importar List

@Entity
@Table(name = "viagens")
@Getter
@NoArgsConstructor // Construtor padrão exigido pelo JPA
@AllArgsConstructor // Construtor com todos os campos (útil para testes, etc.)
@EqualsAndHashCode(of = "id")
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // Estes campos (veiculo e motorista) agora serão opcionais na entidade
    // A validação de obrigatoriedade será feita no serviço, baseada no tipoViagem.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id") // Removido nullable = false aqui
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id") // Removido nullable = false aqui
    private Motorista motorista;

    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) // Status é obrigatório
    private StatusViagem status;

    private String clientName;
    private String telefone;
    private BigDecimal valor; // Usar BigDecimal para valores monetários

    @Column(columnDefinition = "TEXT", nullable = false) // Local de início é obrigatório
    private String startLocation;

    @Column(columnDefinition = "TEXT") // Local de fim pode ser opcional
    private String endLocation;

    @Enumerated(EnumType.STRING) // Garante que o enum seja persistido como String
    @Column(nullable = false) // Tipo de viagem é obrigatório
    private TipoViagem tipoViagem;

    // --- NOVA RELAÇÃO ONE-TO-MANY PARA ITENS DA ROTA ---
    // mappedBy aponta para o campo 'viagem' na entidade ItemRotaColaborador
    // cascade = CascadeType.ALL: Operações (persist, remove, merge) na Viagem serão propagadas para ItemRotaColaborador
    // orphanRemoval = true: Itens da rota que forem removidos da coleção aqui serão deletados do banco
    // fetch = FetchType.LAZY: Carrega os itens da rota apenas quando acessados
    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemRotaColaborador> itensRota = new ArrayList<>(); // Inicializar para evitar NullPointerException

    // --- NOVO CONSTRUTOR PARA CADASTRO A PARTIR DO DTO ---
    // Este construtor precisará ser ajustado para lidar com itensRota
    public Viagem(DadosCadastroViagem dados, Veiculo veiculo, Motorista motorista) {
        this.title = dados.title();
        this.clientName = dados.clientName();
        this.telefone = dados.telefone();
        this.valor = dados.valor();
        this.startLocation = dados.startLocation();
        this.endLocation = dados.endLocation();
        this.startDate = dados.startDate();
        this.startTime = dados.startTime();
        this.endDate = dados.endDate();
        this.endTime = dados.endTime();
        this.status = StatusViagem.AGENDADA; // Status inicial padrão
        this.tipoViagem = dados.tipoViagem(); // Usar o tipo de viagem do DTO

        // Atribui veiculo e motorista APENAS se não for uma rota de colaboradores
        // Se for rota, esses campos serão nulos e a lógica estará nos itensRota
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            this.veiculo = veiculo;
            this.motorista = motorista;
        } else {
            this.veiculo = null;
            this.motorista = null;
        }

        // A lista de itensRota será preenchida no serviço, após a Viagem ser persistida
        this.itensRota = new ArrayList<>(); // Garante que a lista é inicializada
    }

    // --- MÉTODO DE ATUALIZAÇÃO DE INFORMAÇÕES ---
    // Este método também precisará ser ajustado para lidar com itensRota
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

            // Se o tipo de viagem mudar para ROTA_COLABORADORES, zera os campos diretos
            if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES) {
                this.veiculo = null;
                this.motorista = null;
            }
        }

        // Atualiza as referências de veículo e motorista se forem fornecidas
        // e se o tipo de viagem NÃO for ROTA_COLABORADORES.
        if (this.tipoViagem != TipoViagem.ROTA_COLABORADORES) {
            if (veiculoAtualizado != null) {
                this.veiculo = veiculoAtualizado;
            }
            if (motoristaAtualizado != null) {
                this.motorista = motoristaAtualizado;
            }
        }

        // A lógica para atualizar 'itensRota' será mais complexa e tratada no serviço.
        // Geralmente envolve limpar a lista existente e adicionar os novos itens do DTO.
    }

    // Métodos auxiliares para gerenciar a lista de itens da rota
    public void adicionarItemRota(ItemRotaColaborador item) {
        this.itensRota.add(item);
        item.setViagem(this); // Garante a bidirecionalidade
    }

    public void removerItemRota(ItemRotaColaborador item) {
        this.itensRota.remove(item);
        item.setViagem(null); // Remove a referência
    }
}