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
  loginError = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loginError = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        switch (err.status) {
          case 0:
            this.loginError = 'No se pudo conectar al servidor. Intente más tarde.';
            break;
          case 403:
            this.loginError = 'Tu usuario está inactivo. Contacta al administrador.';
            break;
          case 401:
          case 404:
            this.loginError = 'Credenciales incorrectas.';
            break;
          case 500:
            this.loginError = 'Error interno del servidor. Intente más tarde.';
            break;
          default:
            this.loginError = err?.error?.message || 'Error inesperado. Intente nuevamente.';
        }
      }
    });
  }
}
