import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'esp-ai-assistant-composer',
  template: `
    <textarea
      class="chat-composer"
      [placeholder]="placeholder()"
      (keydown.enter)="onHitEnter($event)"
      [formControl]="ctrl"
    ></textarea>
    <button class="send-button" aria-label="Send" (click)="onSendMessage()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        height="24"
        width="24"
      >
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
        <path d="M12 8l-4 4"></path>
        <path d="M12 8v8"></path>
        <path d="M16 12l-4 -4"></path>
      </svg>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      textarea {
        width: 100%;
        height: 48px;
        padding: 16px;
        border-radius: 24px;
        border: 1px solid rgba(61, 60, 58, 0.88);
      }

      .send-button {
        position: absolute;
        right: 8px;
        top: 11px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class ComposerComponent {
  sendMessage = output<string>();
  placeholder = input<string>('What products are you looking for?');

  readonly ctrl = new FormControl(
    'Please help me to create a presentation with red mugs',
    { nonNullable: true }
  );

  onHitEnter($event: Event) {
    $event.preventDefault();

    if (($event as KeyboardEvent).shiftKey) {
      this.ctrl.setValue(this.ctrl.value + '\n');
    } else {
      this.onSendMessage();
    }
  }

  onSendMessage() {
    this.sendMessage.emit(this.ctrl.value);

    this.ctrl.setValue('');
  }
}
