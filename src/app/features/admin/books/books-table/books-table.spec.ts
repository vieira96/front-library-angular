import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { BooksTable } from './books-table';
import { Book } from '@/app/features/books/book.model';

describe('BooksTable', () => {
  let component: BooksTable;
  let fixture: ComponentFixture<BooksTable>;

  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Dom Casmurro',
      isbn: '978-85-359-0277-5',
      publishDate: '1899-01-01',
      gender: 'ROMANCE',
      price: 49.9,
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
      author: { id: 'author-1', name: 'Machado de Assis' },
    },
    {
      id: '2',
      title: 'A Hora da Estrela',
      isbn: '978-85-209-0307-6',
      publishDate: '1977-01-01',
      gender: 'ROMANCE',
      price: 39.9,
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
      author: { id: 'author-2', name: 'Clarice Lispector' },
    },
  ];

  beforeAll(() => {
    registerLocaleData(localePt);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('books', mockBooks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a row for each book', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);
  });

  it('should display book data', () => {
    const firstRow = fixture.nativeElement.querySelector('tbody tr');

    expect(firstRow.textContent).toContain('Dom Casmurro');
    expect(firstRow.textContent).toContain('978-85-359-0277-5');
    expect(firstRow.textContent).toContain('Machado de Assis');
    expect(firstRow.textContent).toContain('01/01/1899');
    expect(firstRow.textContent).toContain('49,90');
  });

  it('should render disabled edit and delete actions for each book', () => {
    const editButtons = fixture.nativeElement.querySelectorAll('[aria-label="Editar livro (indisponível)"]');
    const deleteButtons = fixture.nativeElement.querySelectorAll('[aria-label="Excluir livro (indisponível)"]');

    expect(editButtons.length).toBe(2);
    expect(deleteButtons.length).toBe(2);
    [...editButtons, ...deleteButtons].forEach((button: HTMLButtonElement) => {
      expect(button.disabled).toBeTrue();
    });
  });
});
