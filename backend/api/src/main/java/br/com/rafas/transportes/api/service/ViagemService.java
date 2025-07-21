package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.ItemRotaColaborador; // Importar nova entidade
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.TipoViagem; // Importar o enum TipoViagem
import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoViagem;
import br.com.rafas.transportes.api.dto.DadosItemRotaColaborador; // Importar DTO de cadastro/atualização de item
import br.com.rafas.transportes.api.repository.ItemRotaColaboradorRepository; // Importar novo repositório
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViagemService {

    @Autowired
    private ViagemRepository viagemRepository;

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Autowired // NOVO: Injeção do repositório de ItemRotaColaborador
    private ItemRotaColaboradorRepository itemRotaColaboradorRepository;

    @Transactional
    public DadosDetalhamentoViagem cadastrar(DadosCadastroViagem dados) {
        // --- Validações Condicionais para Veículo/Motorista ---
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            // Para tipos de viagem que NÃO são ROTA_COLABORADORES, veiculoId e motoristaId são obrigatórios
            if (dados.veiculoId() == null) {
                throw new ValidationException("O ID do veículo é obrigatório para este tipo de viagem.");
            }
            if (dados.motoristaId() == null) {
                throw new ValidationException("O ID do motorista é obrigatório para este tipo de viagem.");
            }
        } else {
            // Para ROTA_COLABORADORES, a lista de itens da rota é que deve ser validada
            if (dados.itensRota() == null || dados.itensRota().isEmpty()) {
                throw new ValidationException("Para rotas de colaboradores, é necessário adicionar ao menos um veículo com motorista e horários.");
            }
        }

        // --- Busca de Veículo e Motorista (Condicional) ---
        Veiculo veiculoPrincipal = null;
        if (dados.veiculoId() != null && dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            veiculoPrincipal = veiculoRepository.findById(dados.veiculoId())
                    .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
        }

        Motorista motoristaPrincipal = null;
        if (dados.motoristaId() != null && dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            motoristaPrincipal = motoristaRepository.findById(dados.motoristaId())
                    .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
        }

        // Validações de Conflito de Agendamento (para Veículo/Motorista PRINCIPAIS, se aplicável)
        // Se a viagem for do tipo ROTA_COLABORADORES, a validação de conflito individual dos itens da rota
        // precisará ser feita *após* a viagem principal ser criada, ou dentro do loop de itensRota.
        // Por simplicidade inicial, vamos manter a validação para o motorista/veículo principal apenas para tipos de viagem que não são rota.
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            var conflitosMotorista = viagemRepository.findMotoristaConflitos(dados.motoristaId(), dados.startDate(), dados.endDate());
            if (!conflitosMotorista.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O motorista já está em outra viagem neste período.");
            }

            var conflitosVeiculo = viagemRepository.findVeiculoConflitos(dados.veiculoId(), dados.startDate(), dados.endDate());
            if (!conflitosVeiculo.isEmpty()) {
                throw new ValidationException("Conflito de agendamento: O veículo já está em outra viagem neste período.");
            }
        } else {
            // TODO: Para ROTA_COLABORADORES, validar conflito para CADA item da rota
            // Isso pode ser feito iterando sobre dados.itensRota() e chamando o repositório para cada veiculoId/motoristaId
            // para o período da viagem principal (startDate/endDate da viagem).
            // A validação seria mais complexa aqui, comparando datas/horários de início/fim de cada item da rota.
        }


        // Cria a entidade Viagem com as referências principais (ou null se for rota)
        var viagem = new Viagem(dados, veiculoPrincipal, motoristaPrincipal);
        viagemRepository.save(viagem); // Salva a viagem principal primeiro para obter o ID

        // --- Processa e salva os itens da rota de colaboradores (se for esse tipo de viagem) ---
        if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES && dados.itensRota() != null) {
            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                // Busca o veículo e motorista para CADA item da rota
                var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                // TODO: Validação de conflito de agendamento para veiculoItem e motoristaItem para o período da viagem
                // (dados.startDate(), dados.endDate(), itemDados.horarioInicio(), itemDados.horarioFim())

                var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem, itemDados.horarioInicio(), itemDados.horarioFim());
                viagem.adicionarItemRota(itemRota); // Adiciona à lista e seta a referência bidirecional
            }
            // Save já foi chamado acima, o CascadeType.ALL deve persistir os itensRota adicionados
            // Se precisar forçar a atualização da coleção, use viagemRepository.save(viagem); novamente,
            // mas com CascadeType.ALL e orphanRemoval=true, geralmente não é necessário para novas coleções.
        }

        return new DadosDetalhamentoViagem(viagem);
    }

    @Transactional(readOnly = true)
    public List<DadosDetalhamentoViagem> listarTodas() {
        return viagemRepository.findAll().stream()
                .map(DadosDetalhamentoViagem::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public DadosDetalhamentoViagem atualizar(Long id, DadosAtualizacaoViagem dados) {
        var viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Viagem não encontrada com o ID: " + id));

        // --- Busca de Veículo e Motorista (Condicional para atualização) ---
        Veiculo veiculoAtualizado = null;
        if (dados.veiculoId() != null) {
            veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
                    .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
        }

        Motorista motoristaAtualizado = null;
        if (dados.motoristaId() != null) {
            motoristaAtualizado = motoristaRepository.findById(dados.motoristaId())
                    .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
        }

        // --- Validações de Conflito de Agendamento (Condicional) ---
        // A lógica de validação de conflito para veiculo/motorista principal
        // precisa ser ajustada para o tipo de viagem atualizado.
        // Se o tipo de viagem muda para ROTA_COLABORADORES, a validação principal não se aplica.
        TipoViagem tipoViagemValidar = dados.tipoViagem() != null ? dados.tipoViagem() : viagem.getTipoViagem();

        if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES) {
            // Validação de datas/horários para tipos de viagem que não são ROTA_COLABORADORES
            if ((dados.startDate() != null && dados.endDate() != null) || (dados.veiculoId() != null || dados.motoristaId() != null)) {
                LocalDate dataInicioValidar = dados.startDate() != null ? dados.startDate() : viagem.getStartDate();
                LocalDate dataFimValidar = dados.endDate() != null ? dados.endDate() : viagem.getEndDate();
                Long motoristaIdValidar = motoristaAtualizado != null ? motoristaAtualizado.getId() : (viagem.getMotorista() != null ? viagem.getMotorista().getId() : null);
                Long veiculoIdValidar = veiculoAtualizado != null ? veiculoAtualizado.getId() : (viagem.getVeiculo() != null ? viagem.getVeiculo().getId() : null);

                // Validar apenas se os IDs não forem nulos (são nulos para ROTA_COLABORADORES)
                if (motoristaIdValidar != null) {
                    List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitos(motoristaIdValidar, dataInicioValidar, dataFimValidar);
                    conflitosMotorista.removeIf(v -> v.getId().equals(viagem.getId())); // Ignora a própria viagem
                    if (!conflitosMotorista.isEmpty()) {
                        throw new ValidationException("Conflito de agendamento: O motorista já estará em outra viagem neste período após a atualização.");
                    }
                }
                if (veiculoIdValidar != null) {
                    List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitos(veiculoIdValidar, dataInicioValidar, dataFimValidar);
                    conflitosVeiculo.removeIf(v -> v.getId().equals(viagem.getId())); // Ignora a própria viagem
                    if (!conflitosVeiculo.isEmpty()) {
                        throw new ValidationException("Conflito de agendamento: O veículo já estará em outra viagem neste período após a atualização.");
                    }
                }
            }
        } else {
            // TODO: Para ROTA_COLABORADORES, validar conflito para CADA item da rota
            // A lógica de validação de conflito para itens de rota deve ser feita aqui,
            // iterando sobre a nova lista de itens (dados.itensRota()) e verificando conflitos
            // para CADA item (veiculo, motorista, horarios) para o período da viagem principal.
            // Cuidado para ignorar os próprios itens da rota que estão sendo atualizados.
        }


        // Chama o método da entidade para atualizar as informações principais
        viagem.atualizarInformacoes(dados, veiculoAtualizado, motoristaAtualizado);


        // --- Processa e atualiza os itens da rota de colaboradores (se for esse tipo de viagem) ---
        // A estratégia mais comum para atualizar coleções @OneToMany é:
        // 1. Limpar a coleção existente na entidade.
        // 2. Adicionar os novos itens recebidos no DTO.
        // Isso funciona bem com orphanRemoval = true.
        if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES && dados.itensRota() != null) {
            viagem.getItensRota().clear(); // Limpa os itens existentes (orphanRemoval = true deleta do DB)
            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                // Busca o veículo e motorista para CADA item da rota
                var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                // Se o item tiver um ID, significa que já existia e está sendo atualizado.
                // Poderia buscar o item existente para atualizar em vez de criar um novo,
                // mas limpar e adicionar é mais simples com orphanRemoval = true.
                var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem, itemDados.horarioInicio(), itemDados.horarioFim());
                viagem.adicionarItemRota(itemRota); // Adiciona à lista e seta a referência bidirecional
            }
        } else if (dados.tipoViagem() != null && dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES && !viagem.getItensRota().isEmpty()) {
            // Se o tipo de viagem mudou DE ROTA_COLABORADORES para outro tipo, limpar os itens da rota
            viagem.getItensRota().clear();
        }


        return new DadosDetalhamentoViagem(viagem);
    }

    @Transactional
    public void excluir(Long id) {
        if (!viagemRepository.existsById(id)) {
            throw new EntityNotFoundException("Viagem não encontrada com o ID: " + id);
        }
        viagemRepository.deleteById(id);
    }
}