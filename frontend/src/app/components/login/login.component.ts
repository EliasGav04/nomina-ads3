import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        switch (err.status) {
          case 0:
            alert("No se pudo conectar al servidor.");
            break;
          case 401:
            alert("Credenciales incorrectas.");
            break;
          case 403:
            alert("Tu usuario está inactivo. Contacta al administrador.");
            break;
          case 404:
            alert("Usuario no encontrado.");
            break;
          case 500:
            alert("Error interno del servidor.");
            break;
          default:
            alert("Error inesperado. Intente nuevamente.");
        }
      }
    });
  }
}
