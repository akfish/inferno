// tslint:disable:no-console
import { ElementNode } from './element';

// TODO: diff push -> poll
// TODO: use isMounted flag per node, instead of initial render
export class DiffContainer extends ElementNode {
  public get isInitialRender() { return this.$V === null }
  constructor() {
    super('$$Container');
  }
}