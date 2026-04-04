import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionExpirationModalService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('Tu sesión ha expirado. Inicia sesión nuevamente.');

  visible$ = this.visibleSubject.asObservable();
  message$ = this.messageSubject.asObservable();

  open(message?: string): void {
    if (message) {
      this.messageSubject.next(message);
    }
    this.visibleSubject.next(true);
  }

  close(): void {
    this.visibleSubject.next(false);
  }
}
