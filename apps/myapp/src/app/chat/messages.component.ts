import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  RenderMessageComponent,
  type UiAssistantMessage,
  type UiChatMessage,
} from '@hashbrownai/angular';
import type { Chat } from '@hashbrownai/core';

import { MatButton } from '@angular/material/button';

import { ToolChipComponent } from './tool-chip.component';
import { ChatToolMetadata } from './models/metadata';

@Component({
  selector: 'esp-ai-assistant-chat-messages',
  standalone: true,
  imports: [RenderMessageComponent, MatButton, ToolChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (message of collapsedMessages(); track $index) { @switch (message.role)
    { @case ('user') {
    <div class="chat-message user">
      <p>{{ message.content }}</p>
    </div>
    } @case ('assistant') {
    <div
      class="chat-message assistant"
      [class.hasToolCalls]="message.toolCalls.length > 0"
    >
      <div class="assistant-avatar">
        <i class="fa-solid fa-user text-base-400"></i>
      </div>
      <div class="assistant-tools">
        @for (toolCall of message.toolCalls; track $index) { @if (
        toolMetadata()[toolCall.name] && toolMetadata()[toolCall.name].i18n; as
        toolI18n ) {
        <esp-ai-assistant-tool-chip
          [toolCall]="toolCall"
          [pending]="toolI18n.pending"
          [done]="toolI18n.done"
        />
        } @else {
        <esp-ai-assistant-tool-chip
          [toolCall]="toolCall"
          [pending]="'Running ' + toolCall.name"
          [done]="'Ran ' + toolCall.name"
        />
        } }
      </div>

      @if (message.content) {
      <hb-render-message [message]="$any(message)" />
      }
    </div>
    } @case ('error') {
    <div class="chat-message msg-error">
      <i class="fa-solid fa-triangle-exclamation text-danger-500"></i>
      <span>{{ message.content }}</span>
      @if ($last) {
      <button mat-button (click)="retry.emit()">Retry</button>
      }
    </div>
    } } }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 16px;
      }

      .chat-message.user {
        padding: 16px;
        border-radius: 16px;
        width: 80%;
        background-color: lightsteelblue;
        align-self: flex-end;
        margin-top: 16px;
      }

      .chat-message.assistant {
        display: grid;
        width: 100%;
        grid-template-columns: 24px 1fr;
        grid-template-rows: auto auto;
        grid-template-areas:
          'avatar content'
          'blank content';
        column-gap: 16px;
        padding: 16px 0px;
      }

      .chat-message.assistant.hasToolCalls {
        row-gap: 8px;
        grid-template-areas:
          'avatar tools'
          'blank content';
      }

      .assistant-avatar {
        grid-area: avatar;
        display: flex;
      }

      .assistant-avatar img {
        width: 24px;
        height: 24px;
        border-radius: 8px;
      }

      .assistant-tools {
        grid-area: tools;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
      }

      hb-render-message {
        grid-area: content;
      }

      .chat-message.component {
        align-self: flex-start;
        width: 100%;
      }

      .chat-message.tool {
        align-self: flex-start;
        width: 100%;
        font-style: italic;
      }

      .chat-message.msg-error {
        padding: 16px;
        border-radius: 16px;
        width: 80%;
        background-color: lightcoral;
        align-self: flex-start;
        margin-top: 16px;
        display: flex;
        align-items: center;
      }

      .chat-message.msg-error span {
        width: 100%;
      }

      .chat-message.msg-error mat-icon {
        width: 32px !important;
      }

      .chat-message.msg-error .cos-button {
        align-self: flex-end;
        height: 16px;
      }
    `,
  ],
})
export class MessagesComponent {
  retry = output<void>();
  messages = input.required<UiChatMessage<Chat.AnyTool>[]>();
  toolMetadata = input.required<ChatToolMetadata>();
  collapsedMessages = computed(() => {
    const messages = this.messages();
    const collapsedMessages = [];
    let assistantMessageStack: UiAssistantMessage[] = [];

    for (const message of messages) {
      if (message.role === 'assistant' && message.toolCalls.length > 0) {
        assistantMessageStack.push(message);
      } else if (
        message.role === 'assistant' &&
        message.toolCalls.length === 0
      ) {
        assistantMessageStack.push(message);

        collapsedMessages.push(
          this.collapseAssistantMessageStack(assistantMessageStack)
        );
        assistantMessageStack = [];
      } else {
        collapsedMessages.push(message);
      }
    }

    if (assistantMessageStack.length > 0) {
      collapsedMessages.push(
        this.collapseAssistantMessageStack(assistantMessageStack)
      );
    }

    return collapsedMessages;
  });

  collapseAssistantMessageStack(assistantMessageStack: UiAssistantMessage[]) {
    const [firstMessage, ...rest] = assistantMessageStack;
    return rest.reduce((acc: UiAssistantMessage, message) => {
      return {
        ...acc,
        ...message,
        toolCalls: [...acc.toolCalls, ...message.toolCalls],
      };
    }, firstMessage);
  }
}
