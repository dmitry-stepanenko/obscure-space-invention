import { provideMarkdown } from 'ngx-markdown';

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

import { MatCard } from '@angular/material/card';
import {
  createTool,
  createToolWithArgs,
  exposeComponent,
  provideHashbrown,
  uiChatResource,
} from '@hashbrownai/angular';
import { s } from '@hashbrownai/core';

import { ComposerComponent } from './composer.component';
import { MarkdownComponent } from './markdown.component';
import { MessagesComponent } from './messages.component';
import { ChatToolMetadata } from './models/metadata';
import { PresentationDraftComponent } from './domain-specific-components/presentation-draft.component';

@Component({
  selector: 'esp-ai-assistant-chat',
  imports: [ComposerComponent, MessagesComponent],
  template: `
    <div #contentDiv class="chat-messages">
      <esp-ai-assistant-chat-messages
        [toolMetadata]="toolMetadata"
        [messages]="$any(chat.value())"
        (retry)="retryMessages()"
      />
    </div>

    <div class="chat-composer">
      <esp-ai-assistant-composer (sendMessage)="sendMessage($event)" />
    </div>
  `,
  styles: `
    :host {
      display: grid;
      background-color: #fff;
      border-left: 1px solid rgba(255, 255, 255, 0.12);
      grid-template-areas:
        'header'
        'messages'
        'loading'
        'composer';
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 1fr;
      width: 100%;
      height: 100%;
    }

    .chat-header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .chat-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
    }

    .chat-messages {
      grid-area: messages;
      flex-grow: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chat-composer {
      grid-area: composer;
      padding: 0 16px 16px;
    }
  `,
  providers: [
    provideMarkdown(),
    provideHashbrown({
      baseUrl: 'TODO',
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  readonly chat = uiChatResource({
    model: 'gpt-4o@2025-01-01-preview',
    // model: 'gpt-4.1@2025-04-14',
    debugName: 'assistant-chat',
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
    components: [
      exposeComponent(MarkdownComponent, {
        description: 'Show markdown to the user',
        input: {
          data: s.streaming.string('The markdown content'),
        },
      }),
      exposeComponent(MatCard, {
        description: 'Show a card to the user.',
        children: 'any',
      }),
      exposeComponent(PresentationDraftComponent, {
        description: `A UI component that shows a draft to create/update the presentation with products
          
    It can be either a new presentation or the one from the list of suggested presentations.
    Make sure to ask what presentation user wants to use.
    You should not decide what presentation to use yourself. 
          
    If user wants to create a new presentation, make sure you know the presentation name. 
    If you do not know the name, ask the user about it.`,
        input: {
          presentationId: s.string(
            'An id of the existing presentation, if it exists already.'
          ),
          presentationName: s.string(
            'The name of the presentation to create or add products to'
          ),
          products: s.array(
            'The list of products to be added (if any).',
            s.object('The product item', {
              id: s.number('An id of a product') as any,
              name: s.string('The name of a product'),
            })
          ),
          mode: s.enumeration(
            'Whether this component is displayed to create a presentation with products or add products to the existing presentation',
            ['createWithProducts', 'addProducts']
          ),
        },
      }),
    ],
    tools: [
      createTool({
        name: 'getPresentationList',
        description: 'Retrieves the list of existing presentations',
        handler: async () => {
          await new Promise((r) => setTimeout(r, 1000));
          return {
            presentations: [
              {
                id: 1,
                name: 'My mugs',
              },
              {
                id: 2,
                name: 'Umbrella collection',
              },
              {
                id: 3,
                name: 'test presentation',
              },
              {
                id: 4,
                name: 'party gifts',
              },
              {
                id: 5,
                name: 'pens and pencils',
              },
            ],
          };
        },
      }),
      createToolWithArgs({
        name: 'searchProducts',
        description:
          'The method to search products. Returns the list of top 5 matches for the given search term.',
        schema: s.object('Product search input', {
          term: s.string('The search term to find the product'),
        }),
        handler: async (args) => {
          await new Promise((r) => setTimeout(r, 1000));
          return {
            products: [
              {
                ProductId: 6904597,
                Name: 'Crimson Blaze Coffee Mug',
              },
              {
                ProductId: 552956052,
                Name: 'Scarlet Heat Insulated Mug',
              },
              {
                ProductId: 552421970,
                Name: 'Cherry Red Enamel Coffee Cup',
              },
              {
                ProductId: 552602376,
                Name: 'Ruby Red Jumbo Mug',
              },
              {
                ProductId: 552468001,
                Name: 'Carmine Copper Insulated Travel Mug',
              },
            ],
            total: 11100,
          };
        },
      }),
    ],
  });

  readonly toolMetadata: ChatToolMetadata = {};

  readonly contentDiv = viewChild<ElementRef<HTMLDivElement>>('contentDiv');

  constructor() {
    effect(() => {
      // React when messages change
      this.chat.value();
      if (this.contentDiv()?.nativeElement) {
        this.contentDiv()!.nativeElement.scrollTop =
          this.contentDiv()!.nativeElement.scrollHeight;
      }
    });
  }

  sendMessage(message: string) {
    this.chat.sendMessage({ role: 'user', content: message });
  }

  retryMessages() {
    this.chat.resendMessages();
  }
}
