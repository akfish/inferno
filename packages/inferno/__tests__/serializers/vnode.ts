import { CompactVNode, isCompactVNode, formatVNodeTag } from 'inferno';

function stripTextWrapper (v: any) {
  return isCompactVNode(v) && v.type === '$$Text'
    ? v.children
    : v
}

export function print(val: CompactVNode, serialize: (o: any) => string, indent: (s: string) => string): string {
  const { type, children } = val;

  if (type === null) {
    return serialize(children);
  }

  const typeName: string = typeof type === 'function'
    ? type.name
    : type;

  const tag = formatVNodeTag(val);
  
  const lines = [
    `<${tag}${children ? ">" : "/>"}`
  ];
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(c => lines.push(indent(serialize(stripTextWrapper(c)))));
    } else {
      lines.push(indent(serialize(stripTextWrapper(children))));
    }
    lines.push(`</${typeName}>`)
  } 

  return lines.join('\n');
}

export function test(val: any) {
  return isCompactVNode(val);
}