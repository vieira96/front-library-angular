import { Component, ChangeDetectionStrategy, signal, input, output, inject } from '@angular/core';
import { Author } from '../author.model';
import { AuthorsApiService } from '../authors-api.service';

@Component({
  selector: 'app-delete-author-modal',
  standalone: true,
  templateUrl: './delete-author-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAuthorModal {
  private readonly authorsApi = inject(AuthorsApiService);

  readonly author = input.required<Author>();
  readonly cancel = output<void>();
  readonly success = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  confirm(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authorsApi.deleteAuthor(this.author().id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível excluir o autor.');
        this.isLoading.set(false);
      },
    });
  }
}
