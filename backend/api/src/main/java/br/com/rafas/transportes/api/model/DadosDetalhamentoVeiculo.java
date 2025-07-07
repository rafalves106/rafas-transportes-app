package br.com.rafas.transportes.api.model;

public record DadosDetalhamentoVeiculo(
        Long id,
        String model,
        String plate,
        String ano,
        String color,
        String renavam,
        StatusVeiculo status
) {
    public DadosDetalhamentoVeiculo(Veiculo veiculo) {
        this(
                veiculo.getId(),
                veiculo.getModel(),
                veiculo.getPlate(),
                veiculo.getAno(),
                veiculo.getColor(),
                veiculo.getRenavam(),
                veiculo.getStatus()
        );
    }
}