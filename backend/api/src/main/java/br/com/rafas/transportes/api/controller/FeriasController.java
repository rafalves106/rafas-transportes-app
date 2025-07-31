/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosCadastroFerias;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoFerias;
import br.com.rafas.transportes.api.service.FeriasService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/ferias")
@CrossOrigin(origins = "*")
public class FeriasController {

    @Autowired
    private FeriasService feriasService;

    @PostMapping
    @Transactional
    public ResponseEntity<DadosDetalhamentoFerias> cadastrar(@RequestBody @Valid DadosCadastroFerias dados, UriComponentsBuilder uriBuilder) {
        var ferias = feriasService.cadastrar(dados);
        var uri = uriBuilder.path("/ferias/{id}").buildAndExpand(ferias.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoFerias(ferias));
    }
}