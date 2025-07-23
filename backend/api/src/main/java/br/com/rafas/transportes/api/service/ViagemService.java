package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.HorarioItemRota; // Importar nova entidade HorarioItemRota
import br.com.rafas.transportes.api.domain.ItemRotaColaborador;
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.domain.Viagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoViagem;
import br.com.rafas.transportes.api.dto.DadosHorarioItemRota;
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
import java.time.LocalTime;
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

    @Transactional
    public DadosDetalhamentoViagem cadastrar(DadosCadastroViagem dados) {
        // --- Validações Condicionais para Veículo/Motorista e Datas/Horários da Viagem Principal ---
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
            // Validações para cada item da rota e seus horários aninhados
            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                if (itemDados.veiculoId() == null || itemDados.motoristaId() == null || itemDados.horarios() == null || itemDados.horarios().isEmpty()) {
                    throw new ValidationException("Todos os campos (veículo, motorista, e ao menos um horário) são obrigatórios para cada item da rota.");
                }
                for (DadosHorarioItemRota horarioDados : itemDados.horarios()) {
                    if (horarioDados.dataInicio() == null || horarioDados.inicio() == null || horarioDados.dataFim() == null || horarioDados.fim() == null) {
                        throw new ValidationException("Datas e horários de início e fim são obrigatórios para cada período do item da rota.");
                    }
                }
            }
            // Para ROTA_COLABORADORES, startDate, startTime, endDate, endTime da VIAGEM PRINCIPAL
            // são obrigatórios e virão da UI.
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
        if (dados.tipoViagem() == TipoViagem.ROTA_COLABORADORES && dados.itensRota() != null) {
            Long viagemIdParaExcluir = viagem.getId();

            for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                // Cria o ItemRotaColaborador
                var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem);

                // Adiciona e salva os horários para este ItemRotaColaborador
                for (DadosHorarioItemRota horarioDados : itemDados.horarios()) {
                    // Validação de conflito para CADA HORÁRIO de CADA ITEM DA ROTA
                    // Usa as DATAS E HORAS específicas do HORÁRIO do item.
                    List<Viagem> conflitosVeiculoItem = viagemRepository.findVeiculoConflitosByTime(
                            veiculoItem.getId(),
                            horarioDados.dataInicio(), // USAR DATA DE INÍCIO DO HORÁRIO
                            horarioDados.inicio(), // Horário de início DO HORÁRIO
                            horarioDados.dataFim(),    // USAR DATA DE FIM DO HORÁRIO
                            horarioDados.fim(),    // Horário de fim DO HORÁRIO
                            viagemIdParaExcluir
                    );
                    if (!conflitosVeiculoItem.isEmpty()) {
                        throw new ValidationException(
                                "Conflito de agendamento: O veículo '" + veiculoItem.getModel() + "' (item da rota, horário " + horarioDados.inicio() + "-" + horarioDados.fim() + ", data " + horarioDados.dataInicio() + " a " + horarioDados.dataFim() + ") já está ocupado em outra viagem no período."
                        );
                    }

                    List<Viagem> conflitosMotoristaItem = viagemRepository.findMotoristaConflitosByTime(
                            motoristaItem.getId(),
                            horarioDados.dataInicio(), // USAR DATA DE INÍCIO DO HORÁRIO
                            horarioDados.inicio(),
                            horarioDados.dataFim(),    // USAR DATA DE FIM DO HORÁRIO
                            horarioDados.fim(),
                            viagemIdParaExcluir
                    );
                    if (!conflitosMotoristaItem.isEmpty()) {
                        throw new ValidationException(
                                "Conflito de agendamento: O motorista '" + motoristaItem.getNome() + "' (item da rota, horário " + horarioDados.inicio() + "-" + horarioDados.fim() + ", data " + horarioDados.dataInicio() + " a " + horarioDados.dataFim() + ") já está ocupado em outra viagem no período."
                        );
                    }

                    var horario = new HorarioItemRota(); // Use o construtor padrão
                    horario.setDataInicio(horarioDados.dataInicio());
                    horario.setInicio(horarioDados.inicio());
                    horario.setDataFim(horarioDados.dataFim());
                    horario.setFim(horarioDados.fim());
                    // Adicione a linha que define o relacionamento bidirecional explícito
                    horario.setItemRotaColaborador(itemRota); // ESSENCIAL!

                    itemRota.adicionarHorario(horario);
                }
                viagem.adicionarItemRota(itemRota); // Adiciona ItemRotaColaborador à lista da Viagem
            }
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

        TipoViagem tipoViagemValidar = dados.tipoViagem() != null ? dados.tipoViagem() : viagem.getTipoViagem();

        // --- Busca de Veículo e Motorista (Condicional para atualização) ---
        Veiculo veiculoAtualizado = null;
        Motorista motoristaAtualizado = null;

        if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES) {
            if (dados.veiculoId() != null) {
                veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
                        .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
            } else if (viagem.getVeiculo() != null) {
                veiculoAtualizado = viagem.getVeiculo();
            }

            if (dados.motoristaId() != null) {
                motoristaAtualizado = motoristaRepository.findById(dados.motoristaId())
                        .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado com o ID: " + dados.motoristaId()));
            } else if (viagem.getMotorista() != null) {
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
                        id
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
                        id
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
            viagem.getItensRota().clear();

            if (dados.itensRota() != null && !dados.itensRota().isEmpty()) {
                for (DadosItemRotaColaborador itemDados : dados.itensRota()) {
                    // Validação de null/vazio para o item individual
                    if (itemDados.veiculoId() == null || itemDados.motoristaId() == null || itemDados.horarios() == null || itemDados.horarios().isEmpty()) {
                        throw new ValidationException("Todos os campos (veículo, motorista, e ao menos um horário) são obrigatórios para cada item da rota.");
                    }
                    for (DadosHorarioItemRota horarioDados : itemDados.horarios()) {
                        if (horarioDados.dataInicio() == null || horarioDados.inicio() == null || horarioDados.dataFim() == null || horarioDados.fim() == null) {
                            throw new ValidationException("Datas e horários de início e fim são obrigatórios para cada período do item da rota.");
                        }
                    }

                    var veiculoItem = veiculoRepository.findById(itemDados.veiculoId())
                            .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado para o item da rota com ID: " + itemDados.veiculoId()));
                    var motoristaItem = motoristaRepository.findById(itemDados.motoristaId())
                            .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado para o item da rota com ID: " + itemDados.motoristaId()));

                    var itemRota = new ItemRotaColaborador(viagem, veiculoItem, motoristaItem);
                    viagem.adicionarItemRota(itemRota);

                    // Adiciona e salva os horários para este ItemRotaColaborador
                    for (DadosHorarioItemRota horarioDados : itemDados.horarios()) {
                        // **VALIDAÇÃO DE CONFLITO PARA CADA HORÁRIO DE CADA ITEM DA ROTA (ATUALIZAÇÃO)**
                        List<Viagem> conflitosVeiculoItem = viagemRepository.findVeiculoConflitosByTime(
                                veiculoItem.getId(),
                                horarioDados.dataInicio(), // USAR DATA DE INÍCIO DO HORÁRIO
                                horarioDados.inicio(),
                                horarioDados.dataFim(),    // USAR DATA DE FIM DO HORÁRIO
                                horarioDados.fim(),
                                id
                        );
                        if (!conflitosVeiculoItem.isEmpty()) {
                            throw new ValidationException(
                                    "Conflito de agendamento: O veículo '" + veiculoItem.getModel() + "' (item da rota, horário " + horarioDados.inicio() + "-" + horarioDados.fim() + ", data " + horarioDados.dataInicio() + " a " + horarioDados.dataFim() + ") já está ocupado em outra viagem no período."
                            );
                        }

                        List<Viagem> conflitosMotoristaItem = viagemRepository.findMotoristaConflitosByTime(
                                motoristaItem.getId(),
                                horarioDados.dataInicio(), // USAR DATA DE INÍCIO DO HORÁRIO
                                horarioDados.inicio(),
                                horarioDados.dataFim(),    // USAR DATA DE FIM DO HORÁRIO
                                horarioDados.fim(),
                                id
                        );
                        if (!conflitosMotoristaItem.isEmpty()) {
                            throw new ValidationException(
                                    "Conflito de agendamento: O motorista '" + motoristaItem.getNome() + "' (item da rota, horário " + horarioDados.inicio() + "-" + horarioDados.fim() + ", data " + horarioDados.dataInicio() + " a " + horarioDados.dataFim() + ") já está ocupado em outra viagem no período."
                            );
                        }

                        var horario = new HorarioItemRota(); // Use o construtor padrão
                        horario.setDataInicio(horarioDados.dataInicio());
                        horario.setInicio(horarioDados.inicio());
                        horario.setDataFim(horarioDados.dataFim());
                        horario.setFim(horarioDados.fim());
                        // Adicione a linha que define o relacionamento bidirecional explícito
                        horario.setItemRotaColaborador(itemRota); // ESSENCIAL!

                        itemRota.adicionarHorario(horario);
                    }
                }
            }
        } else if (tipoViagemValidar != TipoViagem.ROTA_COLABORADORES && !viagem.getItensRota().isEmpty()) {
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