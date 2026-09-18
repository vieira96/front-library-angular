import { setupComponent } from '@/app/testing/setup-component';
import { Register } from './register';

describe('Register', () => {
  let component: Register;

  beforeEach(async () => {
    const fixture = await setupComponent(Register);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required form fields', () => {
    const form = component.registerForm;
    expect(form.get('name')?.hasError('required')).toBeTrue();
    expect(form.get('email')?.hasError('required')).toBeTrue();
    expect(form.get('password')?.hasError('required')).toBeTrue();
    expect(form.get('confirmPassword')?.hasError('required')).toBeTrue();
  });

  it('should be invalid when passwords do not match', () => {
    component.registerForm.patchValue({
      name: 'João',
      email: 'joao@test.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should be valid when all fields are correct', () => {
    component.registerForm.patchValue({
      name: 'João',
      email: 'joao@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(component.registerForm.valid).toBeTrue();
  });
});
