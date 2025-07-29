/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosDetalhamentoQuilometragemLog;
import br.com.rafas.transportes.api.service.QuilometragemLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quilometragem-log")
public class QuilometragemLogController {

  @Autowired
  private QuilometragemLogService quilometragemLogService;

  @GetMapping
  public ResponseEntity<List<DadosDetalhamentoQuilometragemLog>> listarLogsPorVeiculo(@RequestParam Long veiculoId) {
    List<DadosDetalhamentoQuilometragemLog> logs = quilometragemLogService.listarLogsPorVeiculo(veiculoId);
    return ResponseEntity.ok(logs);
  }

}