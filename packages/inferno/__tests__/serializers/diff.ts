import { isVDomEdit, VDomEdit, isInsertTree, isMoveTree } from 'inferno';

export function print(val: VDomEdit, serialize: (o: any) => string, indent: (s: string) => string) {
  const { type, path, oldValue, newValue } = val;

  const headers = [
    `Diff: ${type}`,
  ];

  const lines = [
    'path:',
    `${path.format()}`, 
    '---'
  ]

  if (oldValue) {
    lines.push(`oldValue:`);
    lines.push(serialize(oldValue));
  }
  if (newValue) {
    if (oldValue && newValue) {
      lines.push('---');
    }
    lines.push(`newValue:`);
    lines.push(serialize(newValue));
  }

  if ((isInsertTree(val) || isMoveTree(val)) && val.before) {
    lines.push(`---`);
    lines.push('Before:');
    lines.push(serialize(val.before));
  }

  return headers.join('\n') + '\n' + indent(lines.join('\n'));
}

export function test(val: any) {
  return isVDomEdit(val);
}