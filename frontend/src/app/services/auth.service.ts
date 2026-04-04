import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionExpirationModalService } from './session-expiration-modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:4000/api/auth'; 
  private tokenKey = 'authToken';
  private logoutTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionExpirationModal: SessionExpirationModalService
  ) {
    this.setupSessionTimer();
  }

  login(username: string, password: string) {
    return this.http.post<{ message: string; token: string }>(
      `${this.apiUrl}/login`,
      { username, password }
    );
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.setupSessionTimer();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }
    return true;
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  isTokenExpired(token?: string | null): boolean {
    const jwtToken = token || this.getToken();
    if (!jwtToken) return true;

    const payload = this.decodeToken(jwtToken);
    if (!payload?.exp) return true;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= payload.exp;
  }

  private setupSessionTimer(): void {
    this.clearLogoutTimer();

    const token = this.getToken();
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      this.clearSession();
      return;
    }

    const expiresAtMs = payload.exp * 1000;
    const delay = expiresAtMs - Date.now();

    if (delay <= 0) {
      this.clearSession();
      this.sessionExpirationModal.open('Tu sesión ha expirado. Inicia sesión nuevamente.');
      return;
    }

    this.logoutTimer = setTimeout(() => {
      this.clearSession();
      this.sessionExpirationModal.open('Tu sesión ha expirado. Inicia sesión nuevamente.');
    }, delay);
  }

  private decodeToken(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.clearLogoutTimer();
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }
}
