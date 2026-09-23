import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DeleteBookModal } from './delete-book-modal';
import { Book } from '../../../books/book.model';
import { environment } from '../../../../../environments/environment';

describe('DeleteBookModal', () => {
  let component: DeleteBookModal;
  let fixture: ComponentFixture<DeleteBookModal>;
  let httpMock: HttpTestingController;

  const mockBook: Book = {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    title: 'Dom Casmurro',
    isbn: '978-85-359-0277-5',
    publishDate: '1899-01-01',
    gender: 'ROMANCE',
    price: 49.9,
    createdAt: '2026-01-01T00:00',
    updatedAt: '2026-01-01T00:00',
    author: { id: 'author-1', name: 'Machado de Assis' },
  };

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      imports: [DeleteBookModal],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DeleteBookModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display book title', () => {
    // Arrange
    const text = fixture.nativeElement.textContent;

    // Assert
    expect(text).toContain('Dom Casmurro');
  });

  it('should emit cancel when clicking cancel button', () => {
    // Arrange
    spyOn(component.cancel, 'emit');

    // Act
    const cancelButton = fixture.nativeElement.querySelector(
      '[data-testid="cancel-delete-book"]',
    );
    cancelButton.click();

    // Assert
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should call API and emit success when confirming delete', () => {
    // Arrange
    spyOn(component.success, 'emit');

    // Act
    const confirmButton = fixture.nativeElement.querySelector(
      '[data-testid="confirm-delete-book"]',
    );
    confirmButton.click();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books/${mockBook.id}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(component.isLoading()).toBeFalse();
    expect(component.success.emit).toHaveBeenCalled();
  });

  it('should show error message when API returns error', () => {
    // Act
    component.confirm();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books/${mockBook.id}`
    );
    req.flush(
      { message: 'Livro não encontrado.' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(component.errorMessage()).toContain('Livro não encontrado.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set loading state while API is pending', () => {
    // Act
    component.confirm();

    // Assert
    expect(component.isLoading()).toBeTrue();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books/${mockBook.id}`
    );
    req.flush(null);

    expect(component.isLoading()).toBeFalse();
  });
});
