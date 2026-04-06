import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  sidebarOpen = false;
  constructor(private authService: AuthService) {}

  canAccess(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    this.closeSidebarMobile();
    this.authService.logout();
  }

}