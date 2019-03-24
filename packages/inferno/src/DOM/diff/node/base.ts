// tslint:disable:no-console object-literal-sort-keys
import { VNode } from '../../../core/types';
import { UpdateText, EditPayload, AddStyles, RemoveStyles, RemoveProps, AddProps, UpdateStyles, UpdateProps, VDomEdit, VPath, EditFlags } from '../types';

export function makeDiff<D extends VDomEdit>(flags: EditFlags, path: VPath, payload: EditPayload<D>): VDomEdit {
  return Object.assign({ isVDomEdit: true, flags, path }, payload) as VDomEdit;
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
      diffs.push(makeDiff(EditFlags.AddStyles, path, this.addStyles));
      this.addStyles = null;
    }

    if (this.updateStyles) {
      diffs.push(makeDiff(EditFlags.UpdateStyles, path, this.updateStyles));
      this.updateStyles = null;
    }

    if (this.removeStyles) {
      diffs.push(makeDiff(EditFlags.RemoveStyles, path, this.removeStyles));
      this.removeStyles = null;
    }

    if (this.addProps) {
      diffs.push(makeDiff(EditFlags.AddProps, path, this.addProps));
      this.addProps = null;
    }

    if (this.updateProps) {
      diffs.push(makeDiff(EditFlags.UpdateProps, path, this.updateProps));
      this.updateProps = null;
    }

    if (this.removeProps) {
      diffs.push(makeDiff(EditFlags.RemoveProps, path, this.removeProps));
      this.removeProps = null;
    }

    if (this.updateTexts) {
      this.updateTexts.forEach(p => diffs.push(makeDiff(EditFlags.UpdateText, path, p)));
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
    // Text node
    if (this.$name === '$$Text') {
      return path.append({
        type: '$$Text',
        key: null,
        className: null 
      } as unknown as VNode, index)
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


