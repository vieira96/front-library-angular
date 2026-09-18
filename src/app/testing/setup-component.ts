import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Type } from '@angular/core';

export async function setupComponent<T>(componentType: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [componentType],
    providers: [provideRouter([]), provideHttpClient()],
  }).compileComponents();

  const fixture = TestBed.createComponent(componentType);
  fixture.detectChanges();
  return fixture;
}
