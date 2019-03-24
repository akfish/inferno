import { VNode } from '../../core/types';

export const enum EditFlags {
  // Edit targets
  Text = 1,
  Props = 1 << 2,
  Styles = 1 << 3,
  Tree = 1 << 4,

  // Verbs
  Update = 1<< 5,
  Add = 1 << 6,
  Remove = 1 << 7,
  Insert = 1 << 8,
  Move = 1 << 9,
  Replace = 1 << 10,

  // Combined
  UpdateText = Update | Text,
  AddStyles = Add | Styles,
  UpdateStyles = Update | Styles,
  RemoveStyles = Remove | Styles,
  AddProps = Add | Props,
  UpdateProps = Update | Props,
  RemoveProps = Remove | Props,
  InsertTree = Insert | Tree,
  MoveTree = Move | Tree,
  RemoveTree = Remove | Tree,
  ReplaceTree = Replace | Tree
}

export interface VDomEdit {
  isVDomEdit: true;
  // type: Op;
  flags: EditFlags;
  path: VPath;
  oldValue?: any;
  newValue?: any;
}

export function isVDomEdit(e: any): e is VDomEdit {
  return e && typeof e === 'object'
    && e.isVDomEdit
    && typeof e.flags === 'number';
}

export interface UpdateText extends VDomEdit {
  // type: 'update-text';
  oldValue: string;
  newValue: string;
}

export function isUpdateText(e: any): e is UpdateText {
  return isVDomEdit(e) 
    && e.flags === EditFlags.UpdateText;
}

export interface AddStyles extends VDomEdit {
  // type: 'add-styles';
  oldValue: null;
  newValue: { [style: string]: string };
}

export function isAddStyles(e: any): e is AddStyles {
  return isVDomEdit(e)
    && e.flags === EditFlags.AddStyles;
}

export interface UpdateStyles extends VDomEdit {
  // type: 'update-styles';
  oldValue: { [style: string]: string };
  newValue: { [style: string]: string };
}

export function isUpdateStyles(e: any): e is UpdateStyles {
  return isVDomEdit(e)
    && e.flags === EditFlags.UpdateStyles;
}

export interface RemoveStyles extends VDomEdit {
  // type: 'remove-styles';
  oldValue: { [style: string]: string };
  newValue: null;
}

export function isRemoveStyles(e: any): e is RemoveStyles {
  return isVDomEdit(e)
    && e.flags === EditFlags.RemoveStyles;
}

export interface AddProps extends VDomEdit {
  // type: 'add-props';
  oldValue: null;
  newValue: { [style: string]: any };
}

export function isAddProps(e: any): e is AddProps {
  return isVDomEdit(e)
    && e.flags === EditFlags.AddProps;
}

export interface UpdateProps extends VDomEdit {
  // type: 'update-props';
  oldValue: { [style: string]: any };
  newValue: { [style: string]: any };
}

export function isUpdateProps(e: any): e is UpdateProps {
  return isVDomEdit(e)
    && e.flags === EditFlags.UpdateProps;
}

export interface RemoveProps extends VDomEdit {
  // type: 'remove-props';
  oldValue: { [style: string]: any };
  newValue: null;
}

export function isRemoveProps(e: any): e is RemoveProps {
  return isVDomEdit(e)
    && e.flags === EditFlags.RemoveProps;
}

export interface InsertTree extends VDomEdit {
  // type: 'insert-tree';
  oldValue: null;
  newValue: CompactVNode | string;
  before: CompactVNode | string | null;
}

export function isInsertTree(e: any): e is InsertTree {
  return isVDomEdit(e)
    && e.flags === EditFlags.InsertTree;
}

export interface MoveTree extends VDomEdit {
  // type: 'move-tree';
  oldValue: CompactVNode | string;
  newValue: null;
  before: CompactVNode | string;
}

export function isMoveTree(e: any): e is MoveTree {
  return isVDomEdit(e)
    && e.flags === EditFlags.MoveTree;
}

export interface RemoveTree extends VDomEdit {
  // type: 'remove-tree';
  oldValue: CompactVNode | string;
  newValue: null;
}

export function isRemoveTree(e: any): e is RemoveTree {
  return isVDomEdit(e)
    && e.flags === EditFlags.RemoveTree;
}

export interface ReplaceTree extends VDomEdit {
  // type: 'replace-tree';
  oldValue: CompactVNode;
  newValue: CompactVNode;
}

export function isReplaceTree(e: any): e is ReplaceTree {
  return isVDomEdit(e)
    && e.flags === EditFlags.ReplaceTree;
}

export type EditPayload<E extends VDomEdit> = Pick<E, Exclude<keyof E, 'isVDomEdit' | 'flags' | 'path'>>;

export interface CompactVNode extends Pick<VNode, Exclude<keyof VNode, 'flags' | 'childFlags' | 'dom' | 'props' | 'ref' | 'isValidated'>> {
  index: number
}

export function isCompactVNode(n: any): n is CompactVNode {
  // TODO: strict check
  return n && typeof n === 'object'
    && (n.type === null || typeof n.type === 'function' || typeof n.type === 'string')
    && (n.key === null || typeof n.key === 'string' || typeof n.key === 'number');
}

/**
 * Remove references to DOM
 * @param node
 */
export function compactVNode(node: VNode | null, index: number): CompactVNode | null {
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
      children = compactVNode(children as VNode, 0) as any;
    }
  }

  return { children, className, key, type, index };
}

export function buildVPathNode(node: VNode, index: number = -1): VPathNode {
  // const { flags, dom, children, childFlags, props, ref, isValidated, ...rest } = node;
  const { className, key, type } = node;

  return { className, key, type, index };
}

export function formatVNodeTag(node: CompactVNode) {
  const { type, key, className, index } = node;

  const typeName: string = typeof type === 'function'
    ? type.name
    : type;
  const metas: string[] = [];
  if (key) { metas.push(`key="${key}"`) }
  if (className) { metas.push(`className="${className}"`)}
  if (index > -1) { metas.push(`$index="${index}"`)}
  
  const tag = `${typeName}${metas.length > 0 ? ' ' + metas.join(' ') : ''}`;

  return tag;
}

export class VPath {
  public static readonly Empty = new VPath();

  public static equals (p1: VPath | null, p2: VPath | null): boolean {
    // At least one of them is null
    if (!p1 || !p2) {
      // True if both are null
      return p1 === p2
    }

    // Check depth
    if (p1.depth !== p2.depth) {
      return false
    }

    // Check each nodes
    for (let i = 0; i < p1.depth; i++) {
      if (!compareVPathNode(p1.path[i], p2.path[i])) {
        return false
      }
    }

    return true
  }

  constructor(public readonly path: VPathNode[] = []) {

  }
  public get depth() { return this.path.length }
  public format(): string {
    return this.path.map(p => {
      const tag = formatVNodeTag(p as unknown as CompactVNode);

      return `<${tag} />`
    }).join('\n')
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
}

export function compareVPathNode(n1: VPathNode, n2: VPathNode): boolean {
  return n1.type === n2.type
    && n1.index === n2.index
    && n1.className === n2.className
    && n1.key === n2.key
}