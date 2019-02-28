// tslint:disable:no-console object-literal-sort-keys
import { VNode } from '../../../core/types';
import { compactVNode, UpdateText, EditPayload, AddStyles, RemoveStyles, RemoveProps, AddProps, UpdateStyles, UpdateProps, InsertTree, RemoveTree, VDomEdit, Op, MoveTree, VPath, ReplaceTree } from '../types';

function makeDiff<D extends VDomEdit>(type: Op, path: VPath, payload: EditPayload<D>): VDomEdit {
  return Object.assign({ type, path }, payload);
}

// const log = (message: any, ...args: any[]) => console.log(message, ...args);
// tslint:disable-next-line:no-empty
// const log = (_message: any, ..._args: any[]) => { }

export function visit(node: TreeNode, cb: (n: TreeNode) => void) {
  // Visit current node
  cb(node);

  // Visit children if any
  const children = (node as any).children;
  if (typeof children ==='object') {
    if (Array.isArray(children)) {
      children.forEach(c => visit(c, cb));
    } else {
      visit(children, cb);
    }
  }
}

export abstract class TreeNode {
  public $rendered = false;
  private static _count: number = 0;
  private static getID() { return this._count++ }

  protected updateTexts: Array<EditPayload<UpdateText>> | null = null;
  protected addStyles: EditPayload<AddStyles> | null = null;
  protected updateStyles: EditPayload<UpdateStyles> | null = null;
  protected removeStyles: EditPayload<RemoveStyles> | null = null;
  protected addProps: EditPayload<AddProps> | null = null;
  protected updateProps: EditPayload<UpdateProps> | null = null;
  protected removeProps: EditPayload<RemoveProps> | null = null;

  public updateText(oldValue: string, newValue: string) {
    if (!this.updateTexts) {
      this.updateTexts = [];
    }
    this.updateTexts.push({
      oldValue,
      newValue
    });
  }

  public addStyle(styleName: string, newValue: string) {
    if (!this.addStyles) {
      this.addStyles = {
        newValue: { [styleName]: newValue },
        oldValue: null
      };
    } else {
      this.addStyles.newValue[styleName] = newValue;
    }
  }

  public updateStyle(styleName: string, oldValue: string, newValue: string) {
    if (!this.updateStyles) {
      this.updateStyles = {
        oldValue: { [styleName]: oldValue },
        newValue: { [styleName]: newValue }
      };
    } else {
      this.updateStyles.oldValue[styleName] = oldValue;
      this.updateStyles.newValue[styleName] = newValue;
    }
  }

  public removeStyle(styleName: string, oldValue: string) {
    if (!this.removeStyles) {
      this.removeStyles = {
        newValue: null,
        oldValue: { [styleName]: oldValue }
      };
    } else {
      this.removeStyles.oldValue[styleName] = oldValue;
    }
  }

  public addProp(propName: string, newValue: any) {
    if (!this.addProps) {
      this.addProps = {
        newValue: { [propName]: newValue },
        oldValue: null
      };
    } else {
      this.addProps.newValue[propName] = newValue;
    }
  }

  public updateProp(propName: string, oldValue: any, newValue: any) {
    if (!this.updateProps) {
      this.updateProps = {
        oldValue: { [propName]: oldValue },
        newValue: { [propName]: newValue }
      };
    } else {
      this.updateProps.oldValue[propName] = oldValue;
      this.updateProps.newValue[propName] = newValue;
    }
  }

  public removeProp(propName: string, oldValue: any) {
    if (!this.removeProps) {
      this.removeProps = {
        newValue: null,
        oldValue: { [propName]: oldValue }
      };
    } else {
      this.removeProps.oldValue[propName] = oldValue;
    }
  }

  /**
   * Build diffs of this node. Then clean all diff caches.
   * @param path 
   */
  protected buildDiffs(path: VPath): VDomEdit[] {
    const diffs: VDomEdit[] = [];

    if (this.addStyles) {
      diffs.push(makeDiff('add-styles', path, this.addStyles));
      this.addStyles = null;
    }

    if (this.updateStyles) {
      diffs.push(makeDiff('update-styles', path, this.updateStyles));
      this.updateStyles = null;
    }

    if (this.removeStyles) {
      diffs.push(makeDiff('remove-styles', path, this.removeStyles));
      this.removeStyles = null;
    }

    if (this.addProps) {
      diffs.push(makeDiff('add-props', path, this.addProps));
      this.addProps = null;
    }

    if (this.updateProps) {
      diffs.push(makeDiff('update-props', path, this.updateProps));
      this.updateProps = null;
    }

    if (this.removeProps) {
      diffs.push(makeDiff('remove-props', path, this.removeProps));
      this.removeProps = null;
    }

    if (this.updateTexts) {
      this.updateTexts.forEach(p => diffs.push(makeDiff('update-text', path, p)));
      this.updateTexts = null;
    }

    return diffs;

  }

  /**
   * Poll all diffs of this node and its children.
   * All diff caches will be cleaned afterwards.
   * @param prevPath 
   */
  public abstract pollDiffs(prevPath: VPath, index: number): VDomEdit[];

  public readonly $id: number;

  // private _$path: string | null = null;

  protected appendToPath(path: VPath = VPath.Empty, index: number = -1): VPath {
    // Skip container
    if (this.$name === '$$Container') {
      return path;
    }
    // Append component VNode first
    if (this.$ComponentVNode) {
      path = path.append(this.$ComponentVNode, index);
      // $VNode is the root of $ComponentVNode
      index = 0;
      // BUG: key is wrong (alway the last), index is wrong
      // log(`Append path ${this.$ComponentVNode.type.name}[${index}]#${this.$ComponentVNode.key}. this = ${this.toShortString()}`)
    }
    return path.append(this.$V, index);
  }

  private _$V: VNode | null = null;

  public get $V(): VNode | null { return this._$V; }
  public set $V(v: VNode | null) {
    // log(`Attach VNode to ${this.toShortString()}`);
    this._$V = v;
    // Deferred $ComponentVNode assignment
    if (v && (v as any).$ComponentVNode) {
      this.$ComponentVNode = (v as any).$ComponentVNode;
      delete (v as any).$ComponentVNode;
    }
  }

  private _$ComponentVNode: VNode | null;
  public get $ComponentVNode() : VNode | null { return this._$ComponentVNode }
  public set $ComponentVNode(v: VNode | null) {
    // log(`Attach component VNode ${v!.type.name}#${v!.key} to ${this.toShortString()}`)
    this._$ComponentVNode = v;
  }

  public toShortString() {
    return `${this.$name}$${this.$id}`
  }

  constructor(public readonly $name) {
    this.$id = TreeNode.getID();
  }
}

export class ParentNode extends TreeNode {
  protected insertTrees: Array<EditPayload<InsertTree>> | null = null;
  protected removeTrees: Array<EditPayload<RemoveTree>> | null = null;
  protected moveTrees: Array<EditPayload<MoveTree>> | null = null;
  protected replaceTrees: Array<EditPayload<ReplaceTree>> | null = null;
  /**
   * Accumulated tree during diffing
   */
  protected pendingTree: TreeNode[] | null = null;

  /**
   * Generate diff for pending tree
   */
  protected flushPendingTree() {
    if (this.pendingTree) {
      this.pendingTree.forEach(t => this.insertTree(t.$V!))
      this.pendingTree = null;
    }
  }

  public insertTree(tree: VNode, before: VNode | null = null) {
    if (!this.insertTrees) {
      this.insertTrees = [];
    }

    this.insertTrees.push({
      newValue: compactVNode(tree)!,
      oldValue: null,
      before: compactVNode(before),
    })
  }

  public moveTree(tree: VNode, before: VNode) {
    if (!this.moveTrees) {
      this.moveTrees = [];
    }

    this.moveTrees.push({
      oldValue: compactVNode(tree)!,
      newValue: null,
      before: compactVNode(before)!
    });
  }

  public removeTree(tree: VNode) {
    if (!this.removeTrees) {
      this.removeTrees = [];
    }

    this.removeTrees.push({
      newValue: null,
      oldValue: compactVNode(tree)!
    })
  }

  public replaceTree(newTree: VNode, oldTree: VNode) {
    if (!this.replaceTrees) {
      this.replaceTrees = [];
    }

    this.replaceTrees.push({
      newValue: compactVNode(newTree)!,
      oldValue: compactVNode(oldTree)!
    })
  }

  protected buildTreeDiffs(path: VPath): VDomEdit[] {
    const diffs: VDomEdit[] = [];

    this.flushPendingTree();

    if (this.insertTrees) {
      this.insertTrees.forEach(p => diffs.push(makeDiff('insert-tree', path, p)));
      this.insertTrees = null;
    }

    if (this.removeTrees) {
      this.removeTrees.forEach(p => diffs.push(makeDiff('remove-tree', path, p)));
      this.removeTrees = null;
    }

    if (this.moveTrees) {
      this.moveTrees.forEach(p => diffs.push(makeDiff('move-tree', path, p)));
      this.moveTrees = null;
    }

    if (this.replaceTrees) {
      this.replaceTrees.forEach(p => diffs.push(makeDiff('replace-tree', path, p)));
      this.replaceTrees = null;
    }

    return diffs;
  }

  public pollDiffs(prevPath: VPath = VPath.Empty, index: number = -1): VDomEdit[] {
    const currentPath = this.appendToPath(prevPath, index);

    // Build diffs of this node
    let diffs = [...this.buildDiffs(currentPath), ...this.buildTreeDiffs(currentPath)]

    // Pull children diffs
    this.children.forEach((child, i) => diffs = diffs.concat(child.pollDiffs(currentPath, i)));

    return diffs;
  }
  public children: TreeNode[] = [];

  public appendChild(child: TreeNode) {
    if (this.$rendered) {
      // log(`Pending Append: ${this} <- ${child}`);
      if (!this.pendingTree) {
        this.pendingTree = [];
      }
      this.pendingTree.push(child);
    } else {
      // log(`Append: ${this} <- ${child}`);
      this.children.push(child);
    }
  }
  public removeChild(child: TreeNode) {
    // log(`Remove: ${child.toShortString()} from ${this.toShortString()} `);
    const index = this.children.indexOf(child);
    if (index >= 0) {
      if (this.$rendered) {
        this.removeTree(child.$V!);
      } else {
        this.children = this.children.splice(index, 1);
      }
    } else {
      throw new RangeError(`Node '${this.toShortString()}' has no child '${child.toShortString()}'`);
    }
  }
  public replaceChild(newChild: TreeNode, lastChild: TreeNode) {
    // TBD: is it possible to encounter replacing child in pending tree?
    const index = this.children.indexOf(lastChild);
    if (index >= 0) {
      if (this.$rendered) {
        this.replaceTree(newChild.$V!, lastChild.$V!);
      } else {
        this.children[index] = newChild;
      }
    } else {
      throw new RangeError(`Node '${this.toShortString()}' has no child '${lastChild.toShortString()}'`);
    }
  }
  public insertBefore(child: TreeNode, before: TreeNode) {
    const childExists = this.children.indexOf(child) >= 0;
    let insertToPendingTree = false;
    let index = this.children.indexOf(before);

    if (index < 0) {
      insertToPendingTree = true;
      index = this.pendingTree
        ? this.pendingTree.indexOf(before)
        : -1;
    }

    if (index >= 0) {
      if (this.$rendered) {
        if (insertToPendingTree) {
          console.assert(!childExists, 'Moving existing child into pending tree!');
          // log(`Pending Insert: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
          this.pendingTree!.splice(index, 0, child);
        } else {
          if (childExists) {
            // log(`Move Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
            this.moveTree(child.$V!, before.$V!);
          } else {
            // log(`Insert Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
            // NOTE: insertBefore **moves** the node, if the node is already under this parent
            this.insertTree(child.$V!, before.$V!);
          }
        }
      } else {
        // log(`Insert: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
        this.children.splice(index, 0, child);
      }
    } else {
      throw new RangeError(`Node '${this.toShortString()}' has no child '${before.toShortString()}'`);
    }
  }

  public get firstChild(): TreeNode | null {
    return this.children[0] || null;
  }
  public get lastChild(): TreeNode | null {
    return this.children.length === 0
      ? this.children[this.children.length - 1]
      : null;
  }
}
