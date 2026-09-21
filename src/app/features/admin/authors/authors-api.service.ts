import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { PageResponse } from '@/app/core/http/page-response.model';
import { Author } from './author.model';
import { CreateAuthorRequest } from './create-update-author-modal/create-update-author-request.model';

@Injectable({ providedIn: 'root' })
export class AuthorsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/authors`;

  getAuthors(page = 1, size = 10, name?: string): Observable<PageResponse<Author>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('include', 'bookCount');

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<PageResponse<Author>>(this.apiUrl, { params });
  }

  createAuthor(request: CreateAuthorRequest): Observable<Author> {
    return this.http.post<Author>(this.apiUrl, request);
  }

  updateAuthor(id: string, request: CreateAuthorRequest): Observable<Author> {
    return this.http.put<Author>(`${this.apiUrl}/${id}`, request);
  }

  deleteAuthor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
