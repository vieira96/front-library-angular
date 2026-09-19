import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreateAuthorModal } from './create-author-modal';
import { environment } from '@/environments/environment';

describe('CreateAuthorModal', () => {
  let component: CreateAuthorModal;
  let fixture: ComponentFixture<CreateAuthorModal>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAuthorModal],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CreateAuthorModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should call API and emit success when form is valid', () => {
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
