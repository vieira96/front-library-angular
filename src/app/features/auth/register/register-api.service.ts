import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest } from './register-request.model';
import { environment } from '../../../../environments/environment';
import { SKIP_AUTH } from '../../../core/auth/auth-context';

@Injectable({ providedIn: 'root' })
export class RegisterApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth/register`;

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, data, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }
}
