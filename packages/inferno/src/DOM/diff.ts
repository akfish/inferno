import { VNode } from '../core/types';

export enum DiffType {
  Text,
  Style,
  Prop,
  VNode
  // TBD: what about reorder?
}

/**
 * NOTE: a !== b
 *       For an ADD op, a === null
 *       For a DELETE op, b === null
 *       For an UPDATE op, a !== null and b !== null
 */
export interface Diff<V> {
  type: DiffType;
  // For text, style, prop diffs, base is the node itself.
  // Otherwise it's the common parent of a and b.
  base: VNode;
  // Original value
  a: V | null;
  // New value
  b: V | null;
}

export interface TextDiff extends Diff<string> {
  type: DiffType.Text;
}

export interface StyleDiff extends Diff<{ [name: string]: string }> {
  type: DiffType.Style;
}

export interface PropDiff extends Diff<{ [name: string]: any }> {
  type: DiffType.Prop;
}

export interface VNodeDiff extends Diff<VNode> {
  type: DiffType.VNode;
}

export function isTextDiff(d: any): d is TextDiff {
  return typeof d === 'object'
    && typeof d.type !== 'undefined'
    && d.type === DiffType.Text;
} 

export function isStyleDiff(d: any): d is StyleDiff {
  return typeof d === 'object'
    && typeof d.type !== 'undefined'
    && d.type === DiffType.Style;
}

export function isPropDiff(d: any): d is PropDiff {
  return typeof d === 'object'
    && typeof d.type !== 'undefined'
    && d.type === DiffType.Prop;
}

export function isVNodeDiff(d: any): d is VNodeDiff {
  return typeof d === 'object'
    && typeof d.type !== 'undefined'
    && d.type === DiffType.VNode;
}