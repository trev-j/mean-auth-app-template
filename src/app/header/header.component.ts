import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { AuthService } from "../auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userIsAuthenticated: boolean = false;

  private authListenerSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {

    this.userIsAuthenticated = this.authService.getIsAuthenticated();

    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated: boolean) => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if(this.authListenerSubscription) {
      this.authListenerSubscription.unsubscribe();
    }
  }
}
