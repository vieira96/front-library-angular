import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { User } from '@/app/core/user/user.model';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let currentUser: ReturnType<typeof signal<User | null>>;

  beforeEach(async () => {
    currentUser = signal<User | null>(null);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        {
          provide: AuthStateService,
          useValue: {
            user: currentUser.asReadonly(),
            logout: jasmine.createSpy('logout'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided title', () => {
    fixture.componentRef.setInput('title', 'Minha Biblioteca');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Minha Biblioteca');
  });

  it('should not display the admin link for a non-admin user', () => {
    currentUser.set(createUser(['USER']));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/admin"]')).toBeNull();
  });

  it('should display the admin link for an admin user', () => {
    currentUser.set(createUser(['ADMIN']));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/admin"]')?.textContent).toContain('Admin');
  });

  it('should logout when the logout button is clicked', () => {
    const authState = TestBed.inject(AuthStateService) as unknown as {
      logout: jasmine.Spy;
    };
    const logoutButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Sair'));

    expect(logoutButton).toBeDefined();
    logoutButton!.click();

    expect(authState.logout).toHaveBeenCalled();
  });

  function createUser(roles: string[]): User {
    return {
      id: 'user-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      roles,
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
    };
  }
});
