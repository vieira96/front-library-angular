import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from './login-request.model';
import { environment } from '@/environments/environment';
import { SKIP_AUTH } from '@/app/core/auth/auth-context';
import { AccessTokenResponse } from '@/app/core/auth/access-token-response.model';

@Injectable({ providedIn: 'root' })
export class LoginApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth/login`;

  login(credentials: LoginRequest): Observable<AccessTokenResponse> {
    return this.http.post<AccessTokenResponse>(this.apiUrl, credentials, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }
}
