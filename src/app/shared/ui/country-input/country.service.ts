import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';

interface IbgeCountry {
  nome: {
    abreviado: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly http = inject(HttpClient);
  private cachedCountries: string[] | null = null;

  getCountries(): Observable<string[]> {
    if (this.cachedCountries) {
      return of(this.cachedCountries);
    }

    return this.http.get<IbgeCountry[]>('https://servicodados.ibge.gov.br/api/v1/paises')
      .pipe(
        map((countries) =>
          countries
            .map(c => c.nome.abreviado)
            .sort((a, b) => a.localeCompare(b))
        ),
        tap((countries) => {
          this.cachedCountries = countries;
        }),
      );
  }
}
