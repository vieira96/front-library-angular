import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreateUpdateAuthorModal } from './create-update-author-modal';
import { Author } from '../author.model';
import { environment } from '@/environments/environment';

describe('CreateUpdateAuthorModal', () => {
  let component: CreateUpdateAuthorModal;
  let fixture: ComponentFixture<CreateUpdateAuthorModal>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateAuthorModal],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CreateUpdateAuthorModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be in update mode when no author is provided', () => {
    expect(component.isUpdate()).toBeFalse();
  });

  it('should emit cancel when clicking cancel button', () => {
    spyOn(component.cancel, 'emit');

    const cancelButton = fixture.nativeElement.querySelectorAll('button')[0];
    cancelButton.click();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should show validation errors when submitting empty form', () => {
    component.submit();

    expect(component.name?.errors?.['required']).toBeTruthy();
    expect(component.birthdate?.errors?.['required']).toBeTruthy();
    expect(component.nationality?.errors?.['required']).toBeTruthy();
  });

  it('should show future date error for future birthdate', () => {
    component.birthdate?.setValue('2099-12-31');
    component.birthdate?.markAsTouched();
    fixture.detectChanges();

    expect(component.birthdate?.errors?.['futureDate']).toBeTruthy();
  });

  it('should call POST API and emit success when creating', () => {
    spyOn(component.success, 'emit');

    component.form.patchValue({
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });

    component.submit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/authors`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });
    req.flush({ id: '1', name: 'Machado de Assis' });

    expect(component.isLoading()).toBeFalse();
    expect(component.success.emit).toHaveBeenCalled();
  });

  it('should show error message when API returns error', () => {
    component.form.patchValue({
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });

    component.submit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/authors`);
    req.flush(
      { message: 'Esse autor já está cadastrado no sistema.' },
      { status: 409, statusText: 'Conflict' }
    );

    expect(component.errorMessage()).toBe('Esse autor já está cadastrado no sistema.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set loading state while API is pending', () => {
    component.form.patchValue({
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });

    component.submit();

    expect(component.isLoading()).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/authors`);
    req.flush({ id: '1', name: 'Machado de Assis' });

    expect(component.isLoading()).toBeFalse();
  });

  it('should disable create button when form is invalid', () => {
    fixture.detectChanges();

    const createButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(createButton.disabled).toBeTrue();
  });

  it('should disable both buttons while loading', () => {
    component.form.patchValue({
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });

    component.submit();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/authors`);
    req.flush({ id: '1', name: 'Machado de Assis' });
  });
});

describe('CreateUpdateAuthorModal - Update mode', () => {
  let component: CreateUpdateAuthorModal;
  let fixture: ComponentFixture<CreateUpdateAuthorModal>;
  let httpMock: HttpTestingController;

  const mockAuthor: Author = {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    name: 'Machado de Assis',
    birthdate: '1839-06-21',
    nationality: 'Brasileira',
    createdAt: '2026-01-01T00:00',
    updatedAt: '2026-01-01T00:00',
    bookCount: 3,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateAuthorModal],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CreateUpdateAuthorModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('author', mockAuthor);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be in update mode when author is provided', () => {
    expect(component.isUpdate()).toBeTrue();
  });

  it('should pre-fill form with author data', () => {
    expect(component.form.get('name')?.value).toBe('Machado de Assis');
    expect(component.form.get('birthdate')?.value).toBe('1839-06-21');
    expect(component.form.get('nationality')?.value).toBe('Brasileira');
  });

  it('should call PUT API and emit success when updating', () => {
    spyOn(component.success, 'emit');

    component.form.patchValue({
      name: 'Machado de Assis Updated',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });

    component.submit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors/${mockAuthor.id}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: 'Machado de Assis Updated',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
    });
    req.flush({ id: mockAuthor.id, name: 'Machado de Assis Updated' });

    expect(component.isLoading()).toBeFalse();
    expect(component.success.emit).toHaveBeenCalled();
  });

  it('should show title "Editar autor" when in update mode', () => {
    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent).toContain('Editar autor');
  });

  it('should show button text "Salvar alterações" when in update mode', () => {
    const submitButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(submitButton.textContent).toContain('Salvar alterações');
  });
});
