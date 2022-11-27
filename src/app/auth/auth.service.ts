import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { AuthData } from './auth-data.model';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated: boolean = false;
  private token: string | null = null;
  private tokenTimer: NodeJS.Timer | null = null;
  private userId: string | null = null;
  private authStatusListener = new Subject<boolean>();

  constructor(private httpClient: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {

    const authData: AuthData = { email: email, password: password };

    this.httpClient.post(BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {

    const authData: AuthData = { email: email, password: password };

    this.httpClient.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + '/login', authData)
      .subscribe((response: any) => {

        const token = response.token;

        this.token = token;

        if(token) {

          const expiresInDuration = response.expiresIn;

          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.userId = response.userId;

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

          this.saveAuthData(this.token, expirationDate, this.userId);

          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {

    const authInformation = this.getAuthData();

    if(!authInformation) {
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {

      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
    }
  }

  logout() {

    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;

    if(this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }

    this.clearAuthData();

    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string | null, expirationDate: Date, userId: string | null) {

    if(token) {
      localStorage.setItem('token', token);
    }

    localStorage.setItem('expiration', expirationDate.toISOString());

    if(userId) {
      localStorage.setItem('userId', userId);
    }
  }

  private clearAuthData() {

    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {

    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if(!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
