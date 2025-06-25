export interface ChatToolMetadata {
  [toolName: string]: {
    i18n: {
      pending: string;
      done: string;
    };
  };
}
