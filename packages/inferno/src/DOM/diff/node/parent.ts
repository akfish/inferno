import { VNode } from '../../../core/types';
import { compactVNode, CompactVNode, EditPayload, InsertTree, RemoveTree, VDomEdit, MoveTree, VPath, ReplaceTree, EditFlags } from '../types';
import { TextNode } from './text';
import { TreeNode, makeDiff } from './base';

function getCompactInternalNode(node: TreeNode | null): CompactVNode | string | null {
  if (!node) {
    return null;
  }
  return node instanceof TextNode
    ? node.nodeValue
    : compactVNode(node.$V)!
}

// class PendingTree {
//   public insertBefore(node: TreeNode, beforeIndex: number = -1) {

//   }
// }


export class ParentNode extends TreeNode {
  protected insertTrees: Array<EditPayload<InsertTree>> | null = null;
  protected removeTrees: Array<EditPayload<RemoveTree>> | null = null;
  protected moveTrees: Array<EditPayload<MoveTree>> | null = null;
  protected replaceTrees: Array<EditPayload<ReplaceTree>> | null = null;
  /**
   * Accumulated tree during diffing
   */
  // protected pendingTree: TreeNode[] | null = null;
  /**
   * Trees to be inserted during diff.
   * Key must be a valid child index, (-1 for appending)
   * Values are nodes to be inserted before key children
   */
  protected pendingInserts: Map<number, TreeNode[]> | null = null;

  /**
   * Prepare an insert queue.
   * @param before
   */
  protected prepareInsertQueue(before: TreeNode): { beforeIndex: number, queue: TreeNode[] } {
    if (!this.pendingInserts) {
      this.pendingInserts = new Map<number, TreeNode[]>();
    }

    const queueIndex = this.children.indexOf(before);

    if (queueIndex >= 0) {
      // `before` is a valid child, gets or creates a queue
      if (!this.pendingInserts.has(queueIndex)) {
        this.pendingInserts.set(queueIndex, []);
      }
      const queue = this.pendingInserts.get(queueIndex)!;
      return { queue, beforeIndex: -1 }
    } else {
      // Not a valid child, checking insertion queuey
      const pendingInserts = this.pendingInserts.values();
      // Rollup uses bubble for cjs, which does not support for...of
      let insertTask = pendingInserts.next();
      while (!insertTask.done) {
        const beforeIndex = insertTask.value.indexOf(before);
        if (beforeIndex >= 0) {
          // Found
          return { queue: insertTask.value, beforeIndex }
        }
        insertTask = pendingInserts.next();
      }
      // Not a valid child, checking insertion queuey
      // for (const key in Array.from(this.pendingInserts.keys())) {
      //   console.log(typeof key)
      // // for (const item of this.pendingInserts) {
      //   // const queue = item[1];
      //   const queue = this.pendingInserts.get(key as unknown as number)!; 
      //   const beforeIndex = queue.indexOf(before);
      //   if (beforeIndex >= 0) {
      //     // Found
      //     return { queue, beforeIndex }
      //   }
      // }
      throw new RangeError(`Node '${this.toShortString()}' has no child '${before.toShortString()}'`);
    }
  }

  protected queueInsertTreeNode(node: TreeNode, before: TreeNode) {
    const { queue, beforeIndex } = this.prepareInsertQueue(before);

    if (beforeIndex < 0) {
      // Append to queue
      queue.push(node);
    } else {
      // Insert to queue before beforeIndex
      queue.splice(beforeIndex, 0, node);
    }
  }

  protected queueAppendTreeNode(node: TreeNode) {
    if (!this.pendingInserts) {
      this.pendingInserts = new Map<number, TreeNode[]>();
    }
    if (!this.pendingInserts.has(-1)) {
      this.pendingInserts.set(-1, []);
    }

    this.pendingInserts.get(-1)!.push(node);
  }

  protected flushPendingTrees() {
    if (this.pendingInserts) {
      // Get sorted indices
      const queueIndices = Array.from(this.pendingInserts.keys());

      // -1 is appending list, put at the end
      if (queueIndices[0] === -1) {
        queueIndices.shift();
        queueIndices.push(-1);
      }

      // Push normalized insert-tree
      queueIndices.forEach(i => {
        const before = this.children[i] || null;
        this.pendingInserts!.get(i)!.forEach(t => this.insertTreeNode(t, before))
      })

      // Clear
      this.pendingInserts = null;
    }
  }

  /**
   * Generate diff for pending tree
   */
  // protected flushPendingTree() {
  //   if (this.pendingTree) {
  //     this.pendingTree.forEach(t => this.insertTreeNode(t));
  //     this.pendingTree = null;
  //   }
  // }
  public insertTreeNode(tree: TreeNode, before: TreeNode | null = null) {
    if (!this.insertTrees) {
      this.insertTrees = [];
    }
    this.insertTrees.push({
      // TextNode doesn't have $V
      // TBD: insert-text diff?
      newValue: getCompactInternalNode(tree)!,
      oldValue: null,
      before: getCompactInternalNode(before),
    });
  }
  public moveTreeNode(tree: TreeNode, before: TreeNode) {
    if (!this.moveTrees) {
      this.moveTrees = [];
    }
    this.moveTrees.push({
      oldValue: getCompactInternalNode(tree)!,
      newValue: null,
      before: getCompactInternalNode(before)!
    });
  }
  public removeTreeNode(tree: TreeNode) {
    if (!this.removeTrees) {
      this.removeTrees = [];
    }
    this.removeTrees.push({
      newValue: null,
      oldValue: getCompactInternalNode(tree)!
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
    // this.flushPendingTree();
    this.flushPendingTrees();
    if (this.insertTrees) {
      this.insertTrees.forEach(p => diffs.push(makeDiff(EditFlags.InsertTree, path, p)));
      this.insertTrees = null;
    }
    if (this.removeTrees) {
      this.removeTrees.forEach(p => diffs.push(makeDiff(EditFlags.RemoveTree, path, p)));
      this.removeTrees = null;
    }
    if (this.moveTrees) {
      this.moveTrees.forEach(p => diffs.push(makeDiff(EditFlags.MoveTree, path, p)));
      this.moveTrees = null;
    }
    if (this.replaceTrees) {
      this.replaceTrees.forEach(p => diffs.push(makeDiff(EditFlags.ReplaceTree, path, p)));
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
      // if (!this.pendingTree) {
      //   this.pendingTree = [];
      // }
      // this.pendingTree.push(child);
      this.queueAppendTreeNode(child);
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
        this.removeTreeNode(child);
      }
      else {
        this.children.splice(index, 1);
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

    if (childExists) {
      console.assert(this.children.indexOf(before) >= 0, 'Moving child before nodes in pending tree!')
      this.moveTreeNode(child, before);
    } else {
      this.queueInsertTreeNode(child, before);
    }
    // let insertToPendingTree = false;
    // let index = this.children.indexOf(before);
    // if (index < 0) {
    //   insertToPendingTree = true;
    //   index = this.pendingTree
    //     ? this.pendingTree.indexOf(before)
    //     : -1;
    // }
    // // BUG: before could be in insertTrees
    // if (index >= 0) {
    //   if (this.$rendered) {
    //     if (insertToPendingTree) {
    //       console.assert(!childExists, 'Moving existing child into pending tree!');
    //       // log(`Pending Insert: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
    //       this.pendingTree!.splice(index, 0, child);
    //     }
    //     else {
    //       if (childExists) {
    //         // log(`Move Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
    //         this.moveTreeNode(child, before);
    //       }
    //       else {
    //         // log(`Insert Diff: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
    //         // NOTE: insertBefore **moves** the node, if the node is already under this parent
    //         this.insertTreeNode(child, before);
    //       }
    //     }
    //   }
    //   else {
    //     // log(`Insert: ${child.toShortString()} before ${before.toShortString()} under ${this.toShortString()} `);
    //     this.children.splice(index, 0, child);
    //   }
    // }
    // else {
    //   throw new RangeError(`Node '${this.toShortString()}' has no child '${before.toShortString()}'`);
    // }
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
