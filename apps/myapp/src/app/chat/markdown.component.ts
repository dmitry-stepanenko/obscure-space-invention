import { MarkdownComponent as NgxMarkdownComponent } from 'ngx-markdown';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'esp-ai-assistant-markdown',
  imports: [NgxMarkdownComponent],
  template: '<markdown [data]="data()"/>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownComponent {
  readonly data = input<string>('');
}
