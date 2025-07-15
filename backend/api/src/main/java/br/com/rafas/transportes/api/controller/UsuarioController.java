/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

  @GetMapping("/me")
  public ResponseEntity<String> getLoggedInUser() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    return ResponseEntity.ok("Usuário autenticado: " + username);
  }
}