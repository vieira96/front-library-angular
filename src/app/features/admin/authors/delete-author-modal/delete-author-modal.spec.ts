import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DeleteAuthorModal } from './delete-author-modal';
import { Author } from '../author.model';
import { environment } from '@/environments/environment';

describe('DeleteAuthorModal', () => {
  let component: DeleteAuthorModal;
  let fixture: ComponentFixture<DeleteAuthorModal>;
  let httpMock: HttpTestingController;

  const mockAuthor: Author = {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    name: 'Machado de Assis',
    birthdate: '1839-06-21',
    nationality: 'Brasileira',
    createdAt: '2026-01-01T00:00',
    updatedAt: '2026-01-01T00:00',
    bookCount: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAuthorModal],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DeleteAuthorModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('author', mockAuthor);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display author name', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Machado de Assis');
  });

  it('should emit cancel when clicking cancel button', () => {
    spyOn(component.cancel, 'emit');

    const cancelButton = fixture.nativeElement.querySelector(
      '[data-testid="cancel-delete-author"]',
    );
    cancelButton.click();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should call API and emit success when confirming delete', () => {
    spyOn(component.success, 'emit');

    const confirmButton = fixture.nativeElement.querySelector(
      '[data-testid="confirm-delete-author"]',
    );
    confirmButton.click();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors/${mockAuthor.id}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(component.isLoading()).toBeFalse();
    expect(component.success.emit).toHaveBeenCalled();
  });

  it('should show error message when API returns 409', () => {
    component.confirm();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors/${mockAuthor.id}`
    );
    req.flush(
      { message: 'Nao e possivel excluir o autor porque ele possui livros cadastrados.' },
      { status: 409, statusText: 'Conflict' }
    );

    expect(component.errorMessage()).toContain('livros cadastrados');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set loading state while API is pending', () => {
    component.confirm();

    expect(component.isLoading()).toBeTrue();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors/${mockAuthor.id}`
    );
    req.flush(null);

    expect(component.isLoading()).toBeFalse();
  });
});
