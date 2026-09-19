import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthorsApiService } from './authors-api.service';
import { environment } from '@/environments/environment';

describe('AuthorsApiService', () => {
  let service: AuthorsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthorsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthors', () => {
    it('should fetch authors with default params', () => {
      const mockResponse = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
      };

      service.getAuthors().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch authors with custom pagination', () => {
      const mockResponse = {
        content: [],
        page: 2,
        size: 5,
        totalElements: 20,
        totalPages: 4,
        hasNext: true,
      };

      service.getAuthors(2, 5).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/authors?page=2&size=5&include=bookCount`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('deleteAuthor', () => {
    it('should delete author by id', () => {
      const authorId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

      service.deleteAuthor(authorId).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/authors/${authorId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
