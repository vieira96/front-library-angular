import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { AdminDashboard } from './dashboard';
import { BooksApiService } from '../../books/books-api.service';
import { Book } from '../../books/book.model';
import { PageResponse } from '../../../core/http/page-response.model';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let booksApi: jasmine.SpyObj<BooksApiService>;
  let booksResponse: Subject<PageResponse<Book>>;

  const mockBooks: Book[] = [
    {
      id: 'book-1',
      title: 'Dom Casmurro',
      isbn: '978-85-359-0277-5',
      publishDate: '1899-01-01',
      gender: 'ROMANCE',
      price: 49.9,
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
      author: { id: 'author-1', name: 'Machado de Assis' },
    },
  ];

  beforeAll(() => {
    registerLocaleData(localePt);
  });

  beforeEach(async () => {
    // Arrange
    booksResponse = new Subject<PageResponse<Book>>();
    booksApi = jasmine.createSpyObj<BooksApiService>('BooksApiService', ['getBooks']);
    booksApi.getBooks.and.returnValue(booksResponse.asObservable());

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([]),
        { provide: BooksApiService, useValue: booksApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load the first three books', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(booksApi.getBooks).toHaveBeenCalledWith(1, 3);
    expect(fixture.nativeElement.querySelector('.animate-spin')).not.toBeNull();
  });

  it('should display the returned books and total', () => {
    // Act
    booksResponse.next(pageResponse(mockBooks));
    booksResponse.complete();
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelectorAll('app-book-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Dom Casmurro');
    expect(fixture.nativeElement.textContent).toContain('Total de livros: 1');
    expect(fixture.nativeElement.querySelector('a[href="/admin/books"]')?.textContent).toContain('Ver todos');
  });

  it('should display an empty state when no books are returned', () => {
    // Act
    booksResponse.next(pageResponse([]));
    booksResponse.complete();
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Nenhum livro cadastrado.');
    expect(fixture.nativeElement.querySelector('app-book-card')).toBeNull();
  });

  it('should display an error when loading books fails', () => {
    // Act
    booksResponse.error(new Error('Falha na API'));
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os livros.');
    expect(fixture.nativeElement.querySelector('.animate-spin')).toBeNull();
  });

  function pageResponse(content: Book[]): PageResponse<Book> {
    return {
      content,
      page: 1,
      size: 3,
      totalElements: content.length,
      totalPages: 1,
      hasNext: false,
    };
  }
});
