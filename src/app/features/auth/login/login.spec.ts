import { setupComponent } from '@/app/testing/setup-component';
import { Login } from './login';

describe('Login', () => {
  let component: Login;

  beforeEach(async () => {
    const fixture = await setupComponent(Login);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
