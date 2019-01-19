import { VNode, StatelessComponent } from '../core/types';
import { DiffContainer, visit } from './diff/node';
import { render } from './rendering';
import { patch } from './patching';
import { Component } from '../core/component';
import { createComponentVNode } from '../core/implementation';
import { VNodeFlags } from 'inferno-vnode-flags';

type ComponentClass<P> = new(props?: P, context?: any) => Component<P>;

export function diff<P>(
  Comp: ComponentClass<P> | StatelessComponent<P>,
  baseProps: P
) {
  const container = new DiffContainer();
  // const base = <Comp {...baseProps} />
  const base = createComponentVNode(VNodeFlags.ComponentUnknown, Comp, baseProps);
  if (container.isInitialRender) {
    // Initial render
    render(base, container);
  }

  visit(container, n => n.$rendered = true);

  const d = {
    compare: (props: P) => {
      const context: Object = {
        $$isDiff$$: true,
        $$isInitialRender$$: false
      }
      const lifecycle: Function[] = [];

      // const node = <Comp {...props} />
      const node = createComponentVNode(VNodeFlags.ComponentUnknown, Comp, props);

      patch(base as VNode, node as VNode, container as unknown as Element, context, false, null, lifecycle);
      return d;
    },
    getBaseInstance: () => base,
    getContainer: () => container,
    getDiffs: () => container.pollDiffs(),
  }

  return d;
}