import { createStore } from '@stencil/store';

export interface LogsStore {
  logs: string[];
}

const { state } = createStore<LogsStore>({
  logs: []
});

export { state as logsStore };