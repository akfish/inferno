import { isVDomEdit, VDomEdit, isInsertTree, isMoveTree, EditFlags, isCompactVNode } from 'inferno';

const FLAG_NAMES = {
  [EditFlags.UpdateText]: 'update-text',
  [EditFlags.AddStyles]: 'add-styles',
  [EditFlags.UpdateStyles]: 'update-styles',
  [EditFlags.RemoveStyles]: 'remove-styles',
  [EditFlags.AddProps]: 'add-props',
  [EditFlags.UpdateProps]: 'update-props',
  [EditFlags.RemoveProps]: 'remove-props',
  [EditFlags.InsertTree]: 'insert-tree',
  [EditFlags.MoveTree]: 'move-tree',
  [EditFlags.RemoveTree]: 'remove-tree',
  [EditFlags.ReplaceTree]: 'replace-tree'
}

function simplifyTextNode (v: any) {
  // Strip $$Text wrapper for text node without index
  return isCompactVNode(v) && v.type === '$$Text' && v.index === -1
    ? v.children
    : v
  
}

export function print(val: VDomEdit, serialize: (o: any) => string, indent: (s: string) => string) {
  const { flags, path, oldValue, newValue } = val;

  const headers = [
    `Diff: ${FLAG_NAMES[flags]}`,
  ];

  const lines = [
    'path:',
    `${path.format()}`, 
    '---'
  ]

  if (oldValue) {
    lines.push(`oldValue:`);
    lines.push(serialize(simplifyTextNode(oldValue)));
  }
  if (newValue) {
    if (oldValue && newValue) {
      lines.push('---');
    }
    lines.push(`newValue:`);
    lines.push(serialize(simplifyTextNode(newValue)));
  }

  if ((isInsertTree(val) || isMoveTree(val)) && val.before) {
    lines.push(`---`);
    lines.push('Before:');
    lines.push(serialize(simplifyTextNode(val.before)));
  }

  return headers.join('\n') + '\n' + indent(lines.join('\n'));
}

export function test(val: any) {
  return isVDomEdit(val);
}