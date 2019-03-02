import { VNode } from '../../../core/types';
import { compactVNode, EditPayload, InsertTree, RemoveTree, VDomEdit, MoveTree, VPath, ReplaceTree } from '../types';
import { TextNode } from './text';
import { TreeNode, makeDiff } from './base';
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
      this.pendingTree.forEach(t => this.insertTreeNode(t));
      this.pendingTree = null;
    }
  }
  public insertTreeNode(tree: TreeNode, before: VNode | null = null) {
    if (!this.insertTrees) {
      this.insertTrees = [];
    }
    this.insertTrees.push({
      // TextNode doesn't have $V
      // TBD: insert-text diff?
      newValue: tree instanceof TextNode
        ? tree.nodeValue
        : compactVNode(tree.$V)!,
      oldValue: null,
      before: compactVNode(before),
    });
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
    });
  }
  public replaceTree(newTree: VNode, oldTree: VNode) {
    if (!this.replaceTrees) {
      this.replaceTrees = [];
    }
    this.replaceTrees.push({
      newValue: compactVNode(newTree)!,
      oldValue: compactVNode(oldTree)!
    });
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
    let diffs = [...this.buildDiffs(currentPath), ...this.buildTreeDiffs(currentPath)];
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
    }
    else {
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
      }
      else {
        this.children = this.children.splice(index, 1);
      }
    }
    else {
      throw new RangeError(`Node '${this.toShortString()}' has no child '${child.toShortString()}'`);
    }
  }
  public replaceChild(newChild: TreeNode, lastChild: TreeNode) {
    // TBD: is it possible to encounter replacing child in pending tree?
    const index = this.children.indexOf(lastChild);
    if (index >= 0) {
      if (this.$rendered) {
        this.replaceTree(newChild.$V!, lastChild.$V!);
      }
      else {
        this.children[index] = newChild;
      }
    }
    else {
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
        }
        else {
          if (childExists) {
            // log(`Move Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
            this.moveTree(child.$V!, before.$V!);
          }
          else {
            // log(`Insert Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
            // NOTE: insertBefore **moves** the node, if the node is already under this parent
            this.insertTreeNode(child, before.$V!);
          }
        }
      }
      else {
        // log(`Insert: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
        this.children.splice(index, 0, child);
      }
    }
    else {
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
