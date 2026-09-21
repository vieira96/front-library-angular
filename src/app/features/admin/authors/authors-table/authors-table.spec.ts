import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthorsTable } from './authors-table';
import { Author } from '../author.model';

describe('AuthorsTable', () => {
  let component: AuthorsTable;
  let fixture: ComponentFixture<AuthorsTable>;

  const mockAuthors: Author[] = [
    {
      id: '1',
      name: 'Machado de Assis',
      birthdate: '1839-06-21',
      nationality: 'Brasileira',
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
      bookCount: 3,
    },
    {
      id: '2',
      name: 'Clarice Lispector',
      birthdate: '1920-12-10',
      nationality: 'Brasileira',
      createdAt: '2026-01-01T00:00',
      updatedAt: '2026-01-01T00:00',
      bookCount: 0,
    },
  ];

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      imports: [AuthorsTable],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorsTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('authors', mockAuthors);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render author rows', () => {
    // Act
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    // Assert
    expect(rows.length).toBe(2);
  });

  it('should display author name', () => {
    // Act
    const cells = fixture.nativeElement.querySelectorAll('tbody td');

    // Assert
    expect(cells[0].textContent).toContain('Machado de Assis');
  });

  it('should disable delete button when author has books', () => {
    // Act
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-testid="delete-author-1"]',
    );

    // Assert
    expect(deleteButton.disabled).toBeTrue();
  });

  it('should enable delete button when author has no books', () => {
    // Act
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-testid="delete-author-2"]',
    );

    // Assert
    expect(deleteButton.disabled).toBeFalse();
  });

  it('should open delete modal when clicking enabled delete button', () => {
    // Act
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-testid="delete-author-2"]',
    );
    deleteButton.click();
    fixture.detectChanges();

    // Assert
    expect(component.showDeleteModal()).toBeTrue();
    expect(component.authorToDelete()?.id).toBe('2');
  });

  it('should close delete modal', () => {
    // Arrange
    component.openDeleteModal(mockAuthors[0]);
    fixture.detectChanges();

    // Act
    component.closeDeleteModal();
    fixture.detectChanges();

    // Assert
    expect(component.showDeleteModal()).toBeFalse();
    expect(component.authorToDelete()).toBeNull();
  });

  it('should emit success when delete succeeds', () => {
    // Arrange
    spyOn(component.success, 'emit');

    // Act
    component.openDeleteModal(mockAuthors[0]);
    component.onDeleteSuccess();

    // Assert
    expect(component.showDeleteModal()).toBeFalse();
    expect(component.success.emit).toHaveBeenCalled();
  });

  it('should render edit button for each author', () => {
    // Act
    const editButtons = fixture.nativeElement.querySelectorAll(
      '[data-testid^="edit-author-"]',
    );

    // Assert
    expect(editButtons.length).toBe(2);
  });

  it('should emit edit with author when clicking edit button', () => {
    // Arrange
    spyOn(component.edit, 'emit');

    // Act
    const editButton = fixture.nativeElement.querySelector(
      '[data-testid="edit-author-1"]',
    );
    editButton.click();

    // Assert
    expect(component.edit.emit).toHaveBeenCalledWith(mockAuthors[0]);
  });
});
