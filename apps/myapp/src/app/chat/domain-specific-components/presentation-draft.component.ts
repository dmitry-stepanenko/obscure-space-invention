import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'esp-presentation-draft',
  template: `
    <mat-card class="w-full max-w-md mx-auto p-6">
      <h2 class="text-xl font-semibold mb-4">Presentation Draft</h2>
      <div class="mb-4">
        <strong>
          {{
            mode() === 'createWithProducts'
              ? 'Presentation to be created:'
              : 'Presentation name:'
          }}
        </strong>
        <span class="ml-2">{{ presentationName() }}</span>
      </div>
      <div class="mb-4">
        <strong>Products to be added:</strong>
        <ul class="list-disc list-inside mt-2">
          @for (product of products(); track product.id) {
          <li>{{ product.name }}</li>
          }
        </ul>
      </div>
      <div class="flex justify-end gap-4">
        <button mat-button>Cancel</button>
        <button mat-button (click)="create()">
          {{ mode() === 'createWithProducts' ? 'Create' : 'Add products' }}
        </button>
      </div>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatCard],
})
export class PresentationDraftComponent {
  readonly presentationName = input.required<string>();
  readonly presentationId = input.required<string>();
  readonly products = input.required<{ name: string; id: number }[]>();
  readonly mode = input.required<'createWithProducts' | 'addProducts'>();

  create() {}
}
