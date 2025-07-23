package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroVeiculo;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "veiculos")
@Entity(name = "Veiculo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Manter ou atualizar se você adicionar campos ao construtor
@EqualsAndHashCode(of = "id")
public class Veiculo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;
    private String plate;

    @Enumerated(EnumType.STRING)
    private StatusVeiculo status;

    // NOVO CAMPO: Quilometragem atual do veículo
    // Usamos Integer porque geralmente não tem casas decimais e pode ser null se não informado
    @Column(name = "current_km") // Nome da coluna no banco de dados
    private Integer currentKm;

    public Veiculo(DadosCadastroVeiculo dados) {
        this.model = dados.model();
        this.plate = dados.plate();
        this.status = StatusVeiculo.ATIVO;
        // O currentKm inicial pode ser 0 ou null, dependendo da regra de negócio.
        // Se DadosCadastroVeiculo incluir currentKm, atribua-o aqui.
        this.currentKm = 0; // Valor inicial padrão
    }

    public void desativar() {
        this.status = StatusVeiculo.INATIVO;
    }

    public void atualizarInformacoes(DadosAtualizacaoVeiculo dados) {
        if (dados.model() != null) {
            this.model = dados.model();
        }
        if (dados.plate() != null) {
            this.plate = dados.plate();
        }
        if (dados.status() != null) {
            this.status = dados.status();
        }
        // NOVO: Atualiza a quilometragem atual se fornecida
        if (dados.currentKm() != null) {
            this.currentKm = dados.currentKm();
        }
    }
}