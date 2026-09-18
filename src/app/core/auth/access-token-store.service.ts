import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessTokenStoreService {
  private readonly accessToken = signal<string | null>(null);

  readonly token = this.accessToken.asReadonly();

  set(accessToken: string): void {
    this.accessToken.set(accessToken);
  }

  clear(): void {
    this.accessToken.set(null);
  }
}
