import { Component, ChangeDetectionStrategy, signal, input, output } from '@angular/core';
import { LucideTrash, LucidePencil } from '@lucide/angular';
import { Author } from '../author.model';
import { DatePipe } from '@angular/common';
import { DeleteAuthorModal } from '../delete-author-modal/delete-author-modal';
import { Tooltip } from '@/app/shared/ui/tooltip/tooltip';

@Component({
  selector: 'app-authors-table',
  standalone: true,
  imports: [LucideTrash, LucidePencil, DatePipe, DeleteAuthorModal, Tooltip],
  templateUrl: './authors-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorsTable {
  readonly authors = input.required<Author[]>();
  readonly edit = output<Author>();
  readonly success = output<void>();

  readonly showDeleteModal = signal(false);
  readonly authorToDelete = signal<Author | null>(null);

  openDeleteModal(author: Author): void {
    this.authorToDelete.set(author);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.authorToDelete.set(null);
  }

  onDeleteSuccess(): void {
    this.closeDeleteModal();
    this.success.emit();
  }
}
