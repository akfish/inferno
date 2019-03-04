import { CompactVNode, isCompactVNode, formatVNodeTag } from 'inferno';

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
      children.forEach(c => lines.push(indent(serialize(c))));
    } else {
      lines.push(indent(serialize(children)));
    }
    lines.push(`</${typeName}>`)
  } 

  return lines.join('\n');
}

export function test(val: any) {
  return isCompactVNode(val);
}