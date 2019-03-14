import { VNode, StatelessComponent } from '../core/types';
import { DiffContainer, visit } from './diff/node';
import { render } from './rendering';
import { patch } from './patching';
import { Component } from '../core/component';
import { createComponentVNode } from '../core/implementation';
import { VNodeFlags } from 'inferno-vnode-flags';
import { VDomEdit } from './diff/types';
// import { renderToString } from 'inferno-server';

export type ComponentClass<P> = new (props?: P, context?: any) => Component<P>;

export type ComponentType<P> = ComponentClass<P> | StatelessComponent<P>;

export interface DiffHandle<P> {
  init: (baseProps: P) => DiffHandle<P>;
  compare: (props: P) => DiffHandle<P>;
  getBaseProps: () => P | null;
  getBaseVNode: () => VNode | null;
  getContainer: () => DiffContainer;
  getDiffs: () => VDomEdit[];
}

export function diff<P>(
  Comp: ComponentType<P>
) {
  const container = new DiffContainer();
  // const base = <Comp {...baseProps} />
  let base: VNode | null = null;
  let baseProps: P | null = null;

  const d: DiffHandle<P> = {
    init: (props: P) => {
      if (container.isInitialRender) {
        baseProps = props;
        base = createComponentVNode(VNodeFlags.ComponentUnknown, Comp, baseProps);
        // Initial render
        render(base, container);

        visit(container, n => n.$rendered = true);
      }
      return d;
    },
    // tslint:disable-next-line: object-literal-sort-keys
    compare: (props: P) => {
      if (!base) {
        throw new ReferenceError(`Nothing to compare to. Do initial render first.`)
      }
      const context: Object = {
        $$isDiff$$: true,
        $$isInitialRender$$: false
      }
      const lifecycle: Function[] = [];

      // const node = <Comp {...props} />
      const node = createComponentVNode(VNodeFlags.ComponentUnknown, Comp, props);
      // console.log(renderToString(base) + '\n\n' + renderToString(node));

      patch(base as VNode, node as VNode, container as unknown as Element, context, false, null, lifecycle);
      return d;
    },
    getBaseProps: () => baseProps,
    getBaseVNode: () => base,
    getContainer: () => container,
    getDiffs: () => container.pollDiffs()
  }

  return d;
}