import { TextNode, ElementNode } from "./node";

export class MockDocument {
  public body: any = {}

  public createElement(tagName: string, options?: ElementCreationOptions) {
    return new ElementNode(tagName, options);
  }

  public createTextNode(data: string) { 
    return new TextNode(data);
  }
}

const document = new MockDocument();

export { ElementNode as Node } from './node';

export default document;