import { VDomEdit, VPath } from '../types';
import { TreeNode } from './base';
import { VNode } from '../../../core/types';

export class TextNode extends TreeNode {
  public pollDiffs(prevPath: VPath, index: number): VDomEdit[] {
    const currentPath = this.appendToPath(prevPath, index);
    return this.buildDiffs(currentPath);
  }
  private _nodeValue: string;
  constructor(data: string) {
    super("$$Text");
    this._nodeValue = data;
    // Object.seal(this);
    this._v = {
      type: '$$Text',
      key: null,
      className: null,
      children: this._nodeValue
    }
  }
  private _v: any
  public get $V() {
    return this._v
  }
  public set $V(_value: VNode | null) {
    throw new Error('Unexpected setting TextNode.$V')
  }
  public get nodeValue() { return this._nodeValue; }
  public set nodeValue(value: string) {
    // log(`SetText ${this.toShortString()}: "${this._nodeValue}" -> "${value}"`);
    if (value !== this._nodeValue) {
      if (this.$rendered) {
        this.updateText(this.nodeValue, value);
        // this.addTextDiff(this._nodeValue, value);
      }
      else {
        this._nodeValue = value;
        this._v.children = value;
      }
    }
  }
  public toString() {
    return `"${this._nodeValue}"`;
  }
}
