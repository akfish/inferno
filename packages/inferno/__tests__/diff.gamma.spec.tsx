// tslint:disable:no-empty no-console
import { Component, diff } from 'inferno';
import { cloneDeep } from 'lodash';

interface BiuProps {
  src: string;
}

const FunctionalBar = (props: { value: string }) => <div className="bar"><p>{props.value}</p></div>

class Bar extends Component<{ value: string }, {}>{
  public render() {
    return <div className="bar"><p>{this.props.value}</p></div>
  }
}

class Biu extends Component<BiuProps, {}> {
  public render() {
    return (
      <div>
        {this.props.src.split(' ').map((s, i) => <Bar key={`${i}`} value={s} />)}
      </div>
    )
  }
}

const FunctionalBiu = (props: BiuProps) =>
  <div>
    {props.src.split(' ').map((s, i) => <FunctionalBar key={`${i}`} value={s} />)}
  </div>
const StyleDiffComp = (props: { value: number }) =>
  <div style={{
    color: props.value > 10 ? 'red' : 'green',
    fontFamily: props.value > 10 ? 'monospace' : undefined,
    position: props.value > 10 ? undefined : 'absolute',
    top: `${props.value}px`
  }} />

interface PropDiffCompProps {
  href: string;
  title?: string;
  target?: string;
}

const PropDiffComp = (props: PropDiffCompProps) =>
  <a {...props} />

const TreeDiffComp = (props: { items: string[] }) =>
  <ul>
    {props.items.map((item) => <li key={item}><p><strong>Item: </strong>{item}</p></li>)}
  </ul>

// function printDiff(d: Diff) {
//   const { path, type: diffType, new: newValue, old: oldValue } = d;
//   const pathStr = path.map(({ index, type, className }) => `${typeof type === 'function' ? type.name : type}${className ? '.' + className : ''}[${index}]`).join('>');
//   console.log(`${pathStr} : {${diffType}} ${oldValue} -> ${newValue}`);
// }

// function printDiffs(ds: Diff[]) {
//   ds.forEach(printDiff);
// }
// function printDiff(d: VDomEdit) {
//   const { path, type: diffType, newValue, oldValue } = d;
//   const pathStr = path.path.map(({ type, className }) => `${typeof type === 'function' ? type.name : type}${className ? '.' + className : ''}`).join('>');
//   console.log(`${pathStr} : {${diffType}} ${oldValue} -> ${newValue}`);
// }

// function printDiffs(ds: VDomEdit[]) {
//   ds.forEach(printDiff);
// }

describe('Diff', () => {
  describe('Should not mutate base VNode after diffing', () => {
    // it.todo('Element');
    it('ClassComponent', () => {
      const d = diff(Bar).init({ value: 'test' });
      const initialBaseVNode = cloneDeep(d.getBaseVNode());
      d.compare({ value: 'bar' }).getDiffs();
      const currentBaseVNode = d.getBaseVNode();
      expect(currentBaseVNode).toEqual(initialBaseVNode);
    });
    it('FunctionalComponent', () => {
      const d = diff(FunctionalBar).init({ value: 'test' });
      const initialBaseInstance = cloneDeep(d.getBaseVNode())
      d.compare({ value: 'bar' }).getDiffs();
      const currentBaseInstance = d.getBaseVNode();
      expect(currentBaseInstance).toEqual(initialBaseInstance)
    });
  });
  it('ClassComponent VNode should be in VPath', () => {
    expect(
      diff(Biu)
        .init({ src: 'test' })
        .compare({ src: 'biubiu' })
        .getDiffs()
    ).toMatchSnapshot();
  });
  it('FunctionalComponent VNode should be in VPath', () => {
    expect(
      diff(FunctionalBiu)
        .init({ src: 'test a b c' })
        .compare({ src: 'test biubiu b c' })
        .getDiffs()
    ).toMatchSnapshot();
  });
  it('Should work multiple times', async () => {
    const src = 'this is a test';
    const d = diff(Biu).init({ src });
    const diffs = src
      .split('')
      .map((_, i) => src.substring(0, i) + 'γ' + src.substring(i))
      .map(s => d.compare({ src: s }).getDiffs());

    expect(
      diffs
    ).toMatchSnapshot();
  });
  it('Should work multiple times (functional)', async () => {
    const src = 'this is a test';
    const d = diff(FunctionalBiu).init({ src });
    const diffs = src
      .split('')
      .map((_, i) => src.substring(0, i) + 'γ' + src.substring(i))
      .map(s => d.compare({ src: s }).getDiffs());

    expect(
      diffs
    ).toMatchSnapshot();
  });

  it('Should compute text diff', () => {
    expect(
      diff(Bar)
        .init({ value: 'foo' })
        .compare({ value: 'bar' })
        .getDiffs()
    ).toMatchSnapshot();
  });
  it('Should compute style diff', () => {
    expect(
      // color: green; position: absolute; top: 1px;
      diff(StyleDiffComp)
        .init({ value: 1 })
        // color: red; font-family: monospace; top: 11px;
        .compare({ value: 11 })
        .getDiffs()
    ).toMatchSnapshot();
  });
  it('Should compute props diff', () => {
    expect(
      diff<PropDiffCompProps>(PropDiffComp)
        .init({ href: 'foo', title: 'test' })
        .compare({ href: 'bar', target: '_blank' })
        .getDiffs()
    ).toMatchSnapshot();

  });
  describe('Should compute tree diff', () => {
    it('Mixed', () => {
      expect(
        diff(TreeDiffComp)
          .init({ items: ['a', 'b', 'c'] })
          .compare({ items: ['foo', 'a', 'c', 'd', 'e'] })
          .getDiffs()
      ).toMatchSnapshot();
    });

    it('Append tree', () => {
      expect(
        diff(TreeDiffComp)
          .init({ items: ['a', 'b'] })
          .compare({ items: ['a', 'b', 'c'] })
          .getDiffs()
      ).toMatchSnapshot();
    });

    it('Insert tree', () => {
      expect(
        diff(TreeDiffComp)
          .init({ items: ['a', 'c'] })
          .compare({ items: ['a', 'b', 'c'] })
          .getDiffs()
      ).toMatchSnapshot();
    });

    it('Move tree', () => {
      expect(
        diff(TreeDiffComp)
          .init({ items: ['a', 'c', 'b'] })
          .compare({ items: ['a', 'b', 'c'] })
          .getDiffs()
      ).toMatchSnapshot();
    });

    it('Delete tree', () => {
      expect(
        diff(TreeDiffComp)
          .init({ items: ['a', 'b', 'c'] })
          .compare({ items: ['a', 'c'] })
          .getDiffs()
      ).toMatchSnapshot();
    });
  });
});