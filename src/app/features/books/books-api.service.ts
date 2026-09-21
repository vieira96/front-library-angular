import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { PageResponse } from '@/app/core/http/page-response.model';
import { Book } from './book.model';
import { CreateBookRequest } from '../admin/books/create-update-book-modal/create-book-request.model';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = `${environment.apiBaseUrl}/books`;

  getBooks(page = 1, size = 6): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Book>>(this.apiUrl, { params });
  }

  createBook(request: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, request);
  }

  updateBook(id: string, request: CreateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, request);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
