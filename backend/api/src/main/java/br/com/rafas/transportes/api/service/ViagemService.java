package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoViagem;
import br.com.rafas.transportes.api.dto.DadosItemRotaColaborador;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime; // Certifique-se de importar LocalTime
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

    // Não precisamos de ItemRotaColaboradorRepository aqui diretamente,
    // pois a persistência é feita via CascadeType.ALL na Viagem.
    // @Autowired
    // private ItemRotaColaboradorRepository itemRotaColaboradorRepository;

    @Transactional
    public DadosDetalhamentoViagem cadastrar(DadosCadastroViagem dados) {
        // --- Validações Condicionais para Veículo/Motorista e Datas/Horários ---
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            // Para tipos de viagem que NÃO são ROTA_COLABORADORES, estes campos são obrigatórios
            if (dados.veiculoId() == null) {
                throw new ValidationException("O ID do veículo é obrigatório para este tipo de viagem.");
            }
            if (dados.motoristaId() == null) {
                throw new ValidationException("O ID do motorista é obrigatório para este tipo de viagem.");
            }
            if (dados.startDate() == null) {
                throw new ValidationException("A data de início é obrigatória para este tipo de viagem.");
            }
            if (dados.startTime() == null) {
                throw new ValidationException("A hora de início é obrigatória para este tipo de viagem.");
            }
            // Incluído FRETAMENTO_AEROPORTO aqui
            if (dados.tipoViagem() == TipoViagem.IDA_E_VOLTA_MG ||
                    dados.tipoViagem() == TipoViagem.IDA_E_VOLTA_FORA_MG ||
                    dados.tipoViagem() == TipoViagem.FRETAMENTO_AEROPORTO) {
                if (dados.endDate() == null) {
                    throw new ValidationException("A data de retorno é obrigatória para este tipo de viagem.");
                }
                if (dados.endTime() == null) {
                    throw new ValidationException("A hora de retorno é obrigatória para este tipo de viagem.");
                }
            }
        } else {
            // Para ROTA_COLABORADORES, a lista de itens da rota é que deve ser validada
            if (dados.itensRota() == null || dados.itensRota().isEmpty()) {
                throw new ValidationException("Para rotas de colaboradores, é necessário adicionar ao menos um veículo com motorista e horários.");
            }
            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                if (itemDados.veiculoId() == null || itemDados.motoristaId() == null || itemDados.horarioInicio() == null || itemDados.horarioFim() == null) {
                    throw new ValidationException("Todos os campos (veículo, motorista, horários) são obrigatórios para cada item da rota.");
                }
            }
            // Para ROTA_COLABORADORES, startDate, startTime, endDate, endTime são obrigatórios
            // para definir o 'período' da rota em si, mesmo que os detalhes sejam nos itens.
            if (dados.startDate() == null) {
                throw new ValidationException("A data de início da rota é obrigatória.");
            }
            if (dados.startTime() == null) {
                throw new ValidationException("A hora de início da rota é obrigatória.");
            }
            if (dados.endDate() == null) {
                throw new ValidationException("A data de fim da rota é obrigatória.");
            }
            if (dados.endTime() == null) {
                throw new ValidationException("A hora de fim da rota é obrigatória.");
            }
        }

        // --- Busca de Veículo e Motorista (Condicional) ---
        Veiculo veiculoPrincipal = null;
        Motorista motoristaPrincipal = null;

        // Só busca se o tipo de viagem não for ROTA_COLABORADORES E o ID não for nulo
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            if (dados.veiculoId() != null) {
                veiculoPrincipal = veiculoRepository.findById(dados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
            }
            if (dados.motoristaId() != null) {
                motoristaPrincipal = motoristaRepository.findById(dados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
            }
        }

        // Validações de Conflito de Agendamento (para Veículo/Motorista PRINCIPAIS, se aplicável)
        // Isso é para viagens que NÃO são ROTA_COLABORADORES
        if (dados.tipoViagem() != TipoViagem.ROTA_COLABORADORES) {
            // Se veiculoPrincipal existe, checa conflito
            if (veiculoPrincipal != null && dados.startDate() != null && dados.startTime() != null && dados.endDate() != null && dados.endTime() != null) {
                List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitosByTime(
                        veiculoPrincipal.getId(),
                        dados.startDate(),
                        dados.startTime(),
                        dados.endDate(),
                        dados.endTime(),
                        0L // Para cadastro, não excluímos nenhuma viagem existente
                );
                if (!conflitosVeiculo.isEmpty()) {
                    throw new ValidationException("Conflito de agendamento: O veículo principal já está em outra viagem neste período.");
                }
            }

            // Se motoristaPrincipal existe, checa conflito
            if (motoristaPrincipal != null && dados.startDate() != null && dados.startTime() != null && dados.endDate() != null && dados.endTime() != null) {
                List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitosByTime(
                        motoristaPrincipal.getId(),
                        dados.startDate(),
                        dados.startTime(),
                        dados.endDate(),
                        dados.endTime(),
                        0L // Para cadastro, não excluímos nenhuma viagem existente
                );
                if (!conflitosMotorista.isEmpty()) {
                    throw new ValidationException("Conflito de agendamento: O motorista principal já está em outra viagem neste período.");
                }
            }
        }

        // Cria a entidade Viagem com as referências principais (ou null se for rota)
        var viagem = new Viagem(dados, veiculoPrincipal, motoristaPrincipal);
        viagemRepository.save(viagem); // Salva a viagem principal primeiro para obter o ID

        // --- Processa e salva os itens da rota de colaboradores (se for esse tipo de viagem) ---
        // A validação de conflito para cada item da rota é feita AQUI, após a viagem principal ser salva.
        if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES && dados.itensRota() != null) {
            Long viagemIdParaExcluir = viagem.getId(); // Agora temos o ID da viagem principal

            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                // **VALIDAÇÃO DE CONFLITO PARA CADA ITEM DA ROTA**
                // Usa as datas da viagem principal (dados.startDate/endDate) e os horários do item da rota.
                List<Viagem> conflitosVeiculoItem = viagemRepository.findVeiculoConflitosByTime(
                        veiculoItem.getId(),
                        dados.startDate(), // Data de início da viagem principal
                        itemDados.horarioInicio(), // Horário de início do item
                        dados.endDate(),   // Data de fim da viagem principal
                        itemDados.horarioFim(),    // Horário de fim do item
                        viagemIdParaExcluir // Exclui a própria viagem da checagem de conflito
                );
                if (!conflitosVeiculoItem.isEmpty()) {
                    throw new ValidationException(
                            "Conflito de agendamento: O veículo '" + veiculoItem.getModel() + "' (item da rota) já está ocupado em outra viagem no período."
                    );
                }

                List<Viagem> conflitosMotoristaItem = viagemRepository.findMotoristaConflitosByTime(
                        motoristaItem.getId(),
                        dados.startDate(),
                        itemDados.horarioInicio(),
                        dados.endDate(),
                        itemDados.horarioFim(),
                        viagemIdParaExcluir
                );
                if (!conflitosMotoristaItem.isEmpty()) {
                    throw new ValidationException(
                            "Conflito de agendamento: O motorista '" + motoristaItem.getNome() + "' (item da rota) já está ocupado em outra viagem no período."
                    );
                }

                var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem, itemDados.horarioInicio(), itemDados.horarioFim());
                viagem.adicionarItemRota(itemRota);
            }
            // O save da viagem principal já foi feito. Com CascadeType.ALL, os itensRota serão persistidos.
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

        // Determina o tipo de viagem para validação (se não for alterado, usa o existente)
        TipoViagem tipoViagemValidar = dados.tipoViagem() != null ? dados.tipoViagem() : viagem.getTipoViagem();

        // --- Busca de Veículo e Motorista (Condicional para atualização) ---
        Veiculo veiculoAtualizado = null;
        Motorista motoristaAtualizado = null;

        if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES) {
            if (dados.veiculoId() != null) {
                veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
            } else if (viagem.getVeiculo() != null) { // Se não foi alterado, mantém o existente
                veiculoAtualizado = viagem.getVeiculo();
            }

            if (dados.motoristaId() != null) {
                motoristaAtualizado = motoristaRepository.findById(dados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
            } else if (viagem.getMotorista() != null) { // Se não foi alterado, mantém o existente
                motoristaAtualizado = viagem.getMotorista();
            }
        }

        // --- Validações de Conflito de Agendamento (Condicional para atualização) ---
        // Datas e Horários a serem usados para validação (prioriza dados do DTO, senão usa os da viagem existente)
        LocalDate dataInicioValidar = dados.startDate() != null ? dados.startDate() : viagem.getStartDate();
        LocalTime horaInicioValidar = dados.startTime() != null ? dados.startTime() : viagem.getStartTime();
        LocalDate dataFimValidar = dados.endDate() != null ? dados.endDate() : viagem.getEndDate();
        LocalTime horaFimValidar = dados.endTime() != null ? dados.endTime() : viagem.getEndTime();


        if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES) {
            // Validação de conflito para VEÍCULO PRINCIPAL
            if (veiculoAtualizado != null && dataInicioValidar != null && horaInicioValidar != null && dataFimValidar != null && horaFimValidar != null) {
                List<Viagem> conflitosVeiculo = viagemRepository.findVeiculoConflitosByTime(
                        veiculoAtualizado.getId(),
                        dataInicioValidar,
                        horaInicioValidar,
                        dataFimValidar,
                        horaFimValidar,
                        id // Exclui a própria viagem da checagem
                );
                if (!conflitosVeiculo.isEmpty()) {
                    throw new ValidationException("Conflito de agendamento: O veículo principal já estará em outra viagem neste período após a atualização.");
                }
            }

            // Validação de conflito para MOTORISTA PRINCIPAL
            if (motoristaAtualizado != null && dataInicioValidar != null && horaInicioValidar != null && dataFimValidar != null && horaFimValidar != null) {
                List<Viagem> conflitosMotorista = viagemRepository.findMotoristaConflitosByTime(
                        motoristaAtualizado.getId(),
                        dataInicioValidar,
                        horaInicioValidar,
                        dataFimValidar,
                        horaFimValidar,
                        id // Exclui a própria viagem da checagem
                );
                if (!conflitosMotorista.isEmpty()) {
                    throw new ValidationException("Conflito de agendamento: O motorista principal já estará em outra viagem neste período após a atualização.");
                }
            }
        }

        // Chama o método da entidade para atualizar as informações principais
        viagem.atualizarInformacoes(dados, veiculoAtualizado, motoristaAtualizado);

        // --- Processa e atualiza os itens da rota de colaboradores (se for esse tipo de viagem) ---
        if (tipoViagemValidar == TipoViagem.ROTA_COLABORADORES) {
            // Limpa os itens existentes (orphanRemoval = true deleta do DB)
            viagem.getItensRota().clear();

            if (dados.itensRota() != null && !dados.itensRota().isEmpty()) {
                for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                    // Validação de null/vazio para o item individual
                    if (itemDados.veiculoId() == null || itemDados.motoristaId() == null || itemDados.horarioInicio() == null || itemDados.horarioFim() == null) {
                        throw new ValidationException("Todos os campos (veículo, motorista, horários) são obrigatórios para cada item da rota.");
                    }

                    var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                            .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                    var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                            .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                    // **VALIDAÇÃO DE CONFLITO PARA CADA ITEM DA ROTA (ATUALIZAÇÃO)**
                    List<Viagem> conflitosVeiculoItem = viagemRepository.findVeiculoConflitosByTime(
                            veiculoItem.getId(),
                            dataInicioValidar, // Usa as datas da viagem principal
                            itemDados.horarioInicio(),
                            dataFimValidar,    // Usa as datas da viagem principal
                            itemDados.horarioFim(),
                            id // Passa o ID da viagem atual para excluir da checagem
                    );
                    if (!conflitosVeiculoItem.isEmpty()) {
                        throw new ValidationException(
                                "Conflito de agendamento: O veículo '" + veiculoItem.getModel() + "' (item da rota) já está ocupado em outra viagem no período."
                        );
                    }

                    List<Viagem> conflitosMotoristaItem = viagemRepository.findMotoristaConflitosByTime(
                            motoristaItem.getId(),
                            dataInicioValidar,
                            itemDados.horarioInicio(),
                            dataFimValidar,
                            itemDados.horarioFim(),
                            id // Passa o ID da viagem atual para excluir da checagem
                    );
                    if (!conflitosMotoristaItem.isEmpty()) {
                        throw new ValidationException(
                                "Conflito de agendamento: O motorista '" + motoristaItem.getNome() + "' (item da rota) já está ocupado em outra viagem no período."
                        );
                    }

                    var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem, itemDados.horarioInicio(), itemDados.horarioFim());
                    viagem.adicionarItemRota(itemRota);
                }
            }
        } else if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES && !viagem.getItensRota().isEmpty()) {
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