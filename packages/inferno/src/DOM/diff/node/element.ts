import { Style } from './style';
import { ParentNode } from "./parent";
import { TextNode } from "./text";
export class ElementNode extends ParentNode {
  private _textContent: string = "";
  public get textContent() { return this._textContent; }
  public set textContent(value: string) {
    this._textContent = value;
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Description
    // > Setting `textContent` on a node removes all of the node's children and replaces them with a single text node with the given string value.
    if (this.children.length === 1 && this.children[0] instanceof TextNode) {
      // Single text child, set text directly
      (this.children[0] as TextNode).nodeValue = value;
    } else {
      // Clean all children first
      // TBD: emit one single `remove-all-children` diff
      this.children.forEach(c => this.removeChild(c));
      // If value is non-empty, create a text node
      if (value) {
        this.appendChild(new TextNode(value));
      }
    }
  }
  constructor(public tagName: string, public readonly options?: ElementCreationOptions) {
    super(tagName);
    // log(`Create ${this}`)
    // Object.seal(this);
  }
  private _className: string | null = null;
  public get className(): string | null {
    return this._className;
  }
  public set className(v: string | null) {
    const oldValue = this.className;
    if (oldValue !== v) {
      // log(`SetClassName ${this.toShortString()}.${v}`)
      if (this.$rendered) {
        if (!oldValue) {
          this.addProp('className', v);
        }
        else if (!v) {
          this.removeProp('className', oldValue);
        }
        else {
          this.updateProp('className', oldValue, v);
        }
      }
      else {
        this._className = v;
      }
    }
  }
  public toString() {
    return `<${this.toShortString()} />`;
  }
  // public appendChild(child: TreeNode) {
  //   this.children.push(child);
  //   child.$parentNode = this;
  //   log(`Append child: ${child.$path}>${child}`);
  // }
  private _attrs: {
    [qualifiedName: string]: string;
  } = {};
  public setAttribute(qualifiedName: string, value: string) {
    // log(`Set ${this.toShortString()}.${qualifiedName} = "${value}"`);
    if (this.$rendered) {
      const oldValue = this._attrs[qualifiedName];
      if (oldValue) {
        if (value) {
          this.updateProp(qualifiedName, oldValue, value);
        }
        else {
          this.removeProp(qualifiedName, oldValue);
        }
      }
      else {
        this.addProp(qualifiedName, value);
      }
      // this.addPropDiff(qualifiedName, oldValue || null, value || null);
    }
    else {
      this._attrs[qualifiedName] = value;
    }
  }
  public removeAttribute(qualifiedName: string) {
    if (this._attrs[qualifiedName]) {
      if (this.$rendered) {
        const oldValue = this._attrs[qualifiedName];
        this.removeProp(qualifiedName, oldValue);
        // this.addPropDiff(qualifiedName, oldValue, null);
      }
      else {
        delete this._attrs[qualifiedName];
      }
    }
  }
  private _style = new Style(this);
  public get style() { return this._style; }
}
