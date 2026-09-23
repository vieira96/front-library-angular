import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { LucideLoader, LucidePlus } from '@lucide/angular';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { AuthorsApiService } from './authors-api.service';
import { Author } from './author.model';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { AuthorsTable } from './authors-table/authors-table';
import { Toast } from '../../../shared/ui/toast/toast';
import { CreateUpdateAuthorModal } from './create-update-author-modal/create-update-author-modal';

@Component({
  selector: 'app-admin-authors',
  standalone: true,
  imports: [LucideLoader, LucidePlus, Pagination, AuthorsTable, Toast, CreateUpdateAuthorModal],
  templateUrl: './authors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Authors implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly authorsApi = inject(AuthorsApiService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly authors = signal<Author[]>([]);
  readonly isAuthorsLoading = signal(false);
  readonly authorsErrorMessage = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly successMessage = signal<string | null>(null);
  readonly isCreateUpdateModalOpen = signal(false);
  readonly authorToEdit = signal<Author | null>(null);

  ngOnInit(): void {
    this.authState.restoreSession().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadAuthors();
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
        this.authState.logout();
      },
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.loadAuthors(page);
  }

  onDeleteSuccess(): void {
    this.successMessage.set('Autor excluído com sucesso.');
    this.loadAuthors(this.currentPage());
  }

  openCreateModal(): void {
    this.authorToEdit.set(null);
    this.isCreateUpdateModalOpen.set(true);
  }

  openEditModal(author: Author): void {
    this.authorToEdit.set(author);
    this.isCreateUpdateModalOpen.set(true);
  }

  closeModal(): void {
    this.isCreateUpdateModalOpen.set(false);
    this.authorToEdit.set(null);
  }

  onModalSuccess(): void {
    const isUpdate = !!this.authorToEdit();
    this.closeModal();
    this.successMessage.set(isUpdate ? 'Autor atualizado com sucesso.' : 'Autor cadastrado com sucesso.');
    this.loadAuthors(this.currentPage());
  }

  loadAuthors(page = this.currentPage()): void {
    this.isAuthorsLoading.set(true);
    this.authorsErrorMessage.set(null);

    this.authorsApi.getAuthors(page).subscribe({
      next: (response) => {
        this.authors.set(response.content);
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.isAuthorsLoading.set(false);
      },
      error: () => {
        this.authorsErrorMessage.set('Não foi possível carregar os autores.');
        this.isAuthorsLoading.set(false);
      },
    });
  }
}
