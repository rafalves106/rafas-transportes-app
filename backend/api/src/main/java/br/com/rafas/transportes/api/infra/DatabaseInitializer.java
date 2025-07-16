/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.infra;

import br.com.rafas.transportes.api.domain.usuario.Usuario;
import br.com.rafas.transportes.api.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseInitializer {

    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.findByLogin("rafas") == null) {
                String senhaCriptografada = passwordEncoder.encode("rafastur");
                Usuario adminUser = new Usuario("rafas", senhaCriptografada);
                usuarioRepository.save(adminUser);
            } else {
                System.out.println("Usuário 'admin' já existe no banco de dados.");
            }
        };
    }
}