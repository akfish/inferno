// tslint:disable:no-console
declare var global: any;

import document, { Node } from 'mock-document';

(() => {
  Object.defineProperty(global, 'document', {
    value: document,
    writable: false
  });
  Object.defineProperty(global, 'Node', {
    value: Node,
    writable: false
  });

})();