import { ElementNode } from './element';

export interface StyleMap { [style: string]: string }
export class Style {
  public static formatCssString(styles: StyleMap): string {
    const str: string[] = [];
    for (const style in styles) {
      str.push(`${style}:${styles[style]}`);
    }
    return str.join(';');
  }
  public static parseCssString(css: string): StyleMap {
    const m: StyleMap = {};
    css.split(';')
      .forEach(seg => {
        const [style, value] = seg.split(':');
        m[style.trim()] = (value || '').trim();
      });
    return m;
  }
  constructor(public readonly parent: ElementNode) {
  }
  private _styles: StyleMap = {};
  public get cssText() { return Style.formatCssString(this._styles); }
  public set cssText(value: string) {
    const styles = Style.parseCssString(value);
    // TODO: calculate diff
    this._styles = styles;
  }
  public setProperty(style: string, value: string) {
    if (this.parent.$rendered) {
      const oldValue = this._styles[style];
      if (oldValue) {
        if (value) {
          this.parent.updateStyle(style, oldValue, value);
        }
        else {
          // TODO: also called in removeProperty
          this.parent.removeStyle(style, oldValue);
        }
      }
      else {
        this.parent.addStyle(style, value);
      }
      // this.parent.addStyleDiff(style, oldValue || null, value || null);
    }
    else {
      this._styles[style] = value;
    }
  }
  public removeProperty(style: string) {
    if (this._styles[style]) {
      if (this.parent.$rendered) {
        const oldValue = this._styles[style];
        this.parent.removeStyle(style, oldValue);
        // this.parent.addStyleDiff(style, oldValue, null);
      }
      else {
        delete this._styles[style];
      }
    }
  }
}
