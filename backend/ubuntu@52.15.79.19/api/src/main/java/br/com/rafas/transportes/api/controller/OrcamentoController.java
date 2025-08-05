/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosCadastroOrcamento;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoOrcamento;
import br.com.rafas.transportes.api.service.OrcamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {

    @Autowired
    private OrcamentoService service;

    @PostMapping
    @Transactional
    public ResponseEntity salvar(@RequestBody @Valid DadosCadastroOrcamento dados, UriComponentsBuilder uriBuilder) {
        var orcamento = service.salvar(dados);

        var uri = uriBuilder.path("/orcamentos/{id}").buildAndExpand(orcamento.getId()).toUri();

        return ResponseEntity.created(uri).body(new DadosDetalhamentoOrcamento(orcamento));
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoOrcamento>> listar() {
        var lista = service.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}