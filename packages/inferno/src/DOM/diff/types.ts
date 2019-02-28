import { VNode } from '../../core/types';

export type DiffType = 'text' | 'style' | 'props' | 'tree';

export type Op =
  'update-text' |
  'add-styles' |
  'update-styles' |
  'remove-styles' |
  'add-props' |
  'update-props' |
  'remove-props' |
  'insert-tree' |
  'move-tree' |
  'remove-tree';

export interface VDomEdit {
  type: Op;
  path: VPath;
  oldValue?: any;
  newValue?: any;
}

export interface UpdateText extends VDomEdit {
  type: 'update-text';
  oldValue: string;
  newValue: string;
}

export function isUpdateText(e: any): e is UpdateText {
  return typeof e === 'object'
    && e.type === 'update-text'
    && e.path instanceof VPath
    && typeof e.oldValue === 'string'
    && typeof e.newValue === 'string';
}

export interface AddStyles extends VDomEdit {
  type: 'add-styles';
  oldValue: null;
  newValue: { [style: string]: string };
}

export function isAddStyles(e: any): e is AddStyles {
  return typeof e === 'object'
    && e.type === 'add-styles'
    && e.path instanceof VPath
    && e.oldValue === null
    && typeof e.newValue === 'object';
}

export interface UpdateStyles extends VDomEdit {
  type: 'update-styles';
  oldValue: { [style: string]: string };
  newValue: { [style: string]: string };
}

export function isUpdateStyles(e: any): e is UpdateStyles {
  return typeof e === 'object'
    && e.type === 'update-styles'
    && e.path instanceof VPath
    && typeof e.oldValue === 'object'
    && typeof e.newValue === 'object';
}

export interface RemoveStyles extends VDomEdit {
  type: 'remove-styles';
  oldValue: { [style: string]: string };
  newValue: null;
}

export function isRemoveStyles(e: any): e is RemoveStyles {
  return typeof e === 'object'
    && e.type === 'remove-styles'
    && e.path instanceof VPath
    && typeof e.oldValue === 'object'
    && e.newValue === null;
}

export interface AddProps extends VDomEdit {
  type: 'add-props';
  oldValue: null;
  newValue: { [style: string]: any };
}

export function isAddProps(e: any): e is AddProps {
  return typeof e === 'object'
    && e.type === 'add-props'
    && e.path instanceof VPath
    && e.oldValue === null
    && typeof e.newValue === 'object';
}

export interface UpdateProps extends VDomEdit {
  type: 'update-props';
  oldValue: { [style: string]: any };
  newValue: { [style: string]: any };
}

export function isUpdateProps(e: any): e is UpdateProps {
  return typeof e === 'object'
    && e.type === 'update-props'
    && e.path instanceof VPath
    && typeof e.oldValue === 'object'
    && typeof e.newValue === 'object';
}

export interface RemoveProps extends VDomEdit {
  type: 'remove-props';
  oldValue: { [style: string]: any };
  newValue: null;
}

export function isRemoveProps(e: any): e is RemoveProps {
  return typeof e === 'object'
    && e.type === 'remove-props'
    && e.path instanceof VPath
    && typeof e.oldValue === 'object'
    && e.newValue === null;
}

export interface InsertTree extends VDomEdit {
  type: 'insert-tree';
  oldValue: null;
  newValue: CompactVNode;
  before: CompactVNode | null;
}

export function isInsertTree(e: any): e is InsertTree {
  return typeof e === 'object'
    && e.type === 'insert-tree'
    && e.path instanceof VPath
    && e.oldValue === null
    && isCompactVNode(e.newValue)
    && (e.before === null || isCompactVNode(e.before));
}

export interface MoveTree extends VDomEdit {
  type: 'move-tree';
  oldValue: CompactVNode;
  newValue: null;
  before: CompactVNode;
}

export function isMoveTree(e: any): e is MoveTree {
  return typeof e === 'object'
    && e.type === 'move-tree'
    && e.path instanceof VPath
    && isCompactVNode(e.oldValue)
    && e.newValue === null
    && isCompactVNode(e.before);
}

export interface RemoveTree extends VDomEdit {
  type: 'remove-tree';
  oldValue: CompactVNode;
  newValue: null;
}

export function isRemoveTree(e: any): e is RemoveTree {
  return typeof e === 'object'
    && e.type === 'remove-tree'
    && e.path instanceof VPath
    && isCompactVNode(e.oldValue)
    && e.newValue === null;
}

export type EditPayload<E extends VDomEdit> = Pick<E, Exclude<keyof E, 'type' | 'path'>>;

export type CompactVNode = Pick<VNode, Exclude<keyof VNode, 'flags' | 'childFlags' | 'dom' | 'props' | 'ref' | 'isValidated'>>;

export function isCompactVNode(n: any): n is CompactVNode {
  // TODO: strict check
  return typeof n === 'object';
}

/**
 * Remove references to DOM
 * @param node
 */
export function compactVNode(node: VNode | null): CompactVNode | null {
  if (!node) {
    return null;
  }
  // TBD: keep props?
  // let { children, dom, isValidated, childFlags, flags, props, ref, ...rest } = node;
  // tslint:disable-next-line: prefer-const
  let { children, className, key, type } = node;

  if (typeof children === 'object') {
    if (Array.isArray(children)) {
      children = (children as VNode[]).map(compactVNode);
    } else {
      children = compactVNode(children as VNode) as any;
    }
  }

  return { children, className, key, type };
}

export function buildVPathNode(node: VNode, index: number = -1): VPathNode {
  // const { flags, dom, children, childFlags, props, ref, isValidated, ...rest } = node;
  const { className, key, type } = node;

  return { className, key, type, index };
}

export class VPath {
  public static readonly Empty = new VPath();

  constructor(public readonly path: VPathNode[] = []) {

  }
  /**
   * Append a node into current path.
   * If the node is null, returns a clone.
   * Returns a new instance.
   * @param node
   */
  public append(node: VNode | null, index: number) {
    const p = this.path.slice(); 
    if (node) {
      p.push(buildVPathNode(node, index));
    }

    return new VPath(p);
  }
}

export interface VPathNode extends Pick<CompactVNode, Exclude<keyof CompactVNode, 'children'>> {
  index: number
}