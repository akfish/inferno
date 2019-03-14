// tslint:disable:no-empty no-console
import { diff, VDomEdit } from 'inferno';
import 'colors';
import { createElement } from 'inferno-compat';
import { Markdown } from '@gamma-js/language-markdown';

export interface MarkdownProps {
  src: string
}
// function compareMarkdown(base: string, ...changed: string[]) {
//   const d = diff(MarkdownView).init({ src: base });

//   const diffs = changed.map(src => d.compare({ src }).getDiffs());

//   console.log(diffs);

//   return diffs;
// }

function buildHighlightMask(diffs: VDomEdit[][]) {
  return diffs
    .map(d => {
      if (d.length === 0) {
        return '0';
      } else if (d.length === 1) {
        return MASK[d[0].type] || '?';
      } else {
        return 'x';
      }
    })
    .join('');
}

function scanMarkdown(...source: string[]) {
  const md = new Markdown();
  const src = source.join('\n');
  // const d = diff(MarkdownView).init({ src });
  const d = diff(function MarkdownView(props: MarkdownProps) { return md.renderToReact(createElement, props.src) }).init({ src });
  // const initialBaseSnapshot = renderToSnapshot(d.getBaseVNode()!);
  // console.log(initialBaseSnapshot);

  const diffs = src
    .split('')
    .map((_, i) => src.substring(0, i) + 'γ' + src.substring(i + 1))
    .map(s => {
      // const baseSnapshot = renderToSnapshot(d.getBaseVNode()!);
      // console.log(baseSnapshot);
      // try {
      return d.compare({ src: s }).getDiffs();
      // } catch (err) {
      // return [{ type: 'error', err }]
      // }
    });

  const mask = buildHighlightMask(diffs);
  console.log(formatHighlight(src, mask));

  return diffs;
}

const MASK = {
  'update-style': 'S',
  'update-text': 'T',
  'update-props': 'P'
};

const MASK_COLORS = {
  '0': 'grey',
  '?': 'yellow',
  P: 'blue',
  S: 'green',
  T: 'white',
  x: 'red'
};

function formatHighlight(src: string, mask: string) {
  const hl: string[] = [];

  let offset = 0;
  let len = 1;
  let last = mask[0];

  src = src.replace(/ /g, '•');

  while (offset + len < mask.length) {
    const i = offset + len;
    if (mask[i] !== last) {
      const substr = src.substr(offset, len)
        .replace(/\t/g, '‣‣‣‣')
        .replace(/\n/g, '⏎\n');
      hl.push(substr[MASK_COLORS[last]]);
      last = mask[i];
      offset = i;
      len = 1;
    } else {
      len++;
    }
  }

  // Flush
  hl.push(src.substr(offset)[MASK_COLORS[last]]);

  hl.push(''.reset);

  return hl.join('');
}

export function highlight(...source: string[]) {
  const src = source.join('\n');
  const diffs = scanMarkdown(src);

  const mask = buildHighlightMask(diffs);

  console.log(formatHighlight(src, mask));
}

describe('CommonMark Specs', () => {
  describe('2 Preliminaries', () => {
    describe('2.2 Tabs', () => {
      it('example 1', () => {
        expect(
          scanMarkdown(
            "\tfoo\tbaz\t\tbim",
          )
        ).toMatchSnapshot()
      })
      it('example 2', () => {
        expect(
          scanMarkdown(
            "  \tfoo\tbaz\t\tbim",
          )
        ).toMatchSnapshot()
      })
      it('example 3', () => {
        expect(
          scanMarkdown(
            "    a\ta",
            "    ὐ\ta",
          )
        ).toMatchSnapshot()
      })
      it('example 4', () => {
        expect(
          scanMarkdown(
            "  - foo",
            "",
            "\tbar",
          )
        ).toMatchSnapshot()
      })
      it('example 5', () => {
        expect(
          scanMarkdown(
            "- foo",
            "",
            "\t\tbar",
          )
        ).toMatchSnapshot()
      })
      it('example 6', () => {
        expect(
          scanMarkdown(
            ">\t\tfoo",
          )
        ).toMatchSnapshot()
      })
      it('example 7', () => {
        expect(
          scanMarkdown(
            "-\t\tfoo",
          )
        ).toMatchSnapshot()
      })
      it('example 8', () => {
        expect(
          scanMarkdown(
            "    foo",
            "\tbar",
          )
        ).toMatchSnapshot()
      })
      it('example 9', () => {
        expect(
          scanMarkdown(
            " - foo",
            "   - bar",
            "\t - baz",
          )
        ).toMatchSnapshot()
      })
      it('example 10', () => {
        expect(
          scanMarkdown(
            "#\tFoo",
          )
        ).toMatchSnapshot()
      })
      it('example 11', () => {
        expect(
          scanMarkdown(
            "*\t*\t*\t",
          )
        ).toMatchSnapshot()
      })
    })
  })
  describe('3 Blocks and inlines', () => {
    describe('3.1 Precedence', () => {
      it('example 12', () => {
        expect(
          scanMarkdown(
            "- `one",
            "- two`",
          )
        ).toMatchSnapshot()
      })
    })
  })
  describe('4 Leaf blocks', () => {
    describe('4.1 Thematic breaks', () => {
      it('example 13', () => {
        expect(
          scanMarkdown(
            "***",
            "---",
            "___",
          )
        ).toMatchSnapshot()
      })
      it('example 14', () => {
        expect(
          scanMarkdown(
            "+++",
          )
        ).toMatchSnapshot()
      })
      it('example 15', () => {
        expect(
          scanMarkdown(
            "===",
          )
        ).toMatchSnapshot()
      })
      it('example 16', () => {
        expect(
          scanMarkdown(
            "--",
            "**",
            "__",
          )
        ).toMatchSnapshot()
      })
      it('example 17', () => {
        expect(
          scanMarkdown(
            " ***",
            "  ***",
            "   ***",
          )
        ).toMatchSnapshot()
      })
      it('example 18', () => {
        expect(
          scanMarkdown(
            "    ***",
          )
        ).toMatchSnapshot()
      })
      it('example 19', () => {
        expect(
          scanMarkdown(
            "Foo",
            "    ***",
          )
        ).toMatchSnapshot()
      })
      it('example 20', () => {
        expect(
          scanMarkdown(
            "_____________________________________",
          )
        ).toMatchSnapshot()
      })
      it('example 21', () => {
        expect(
          scanMarkdown(
            " - - -",
          )
        ).toMatchSnapshot()
      })
      it('example 22', () => {
        expect(
          scanMarkdown(
            " **  * ** * ** * **",
          )
        ).toMatchSnapshot()
      })
      it('example 23', () => {
        expect(
          scanMarkdown(
            "-     -      -      -",
          )
        ).toMatchSnapshot()
      })
      it('example 24', () => {
        expect(
          scanMarkdown(
            "- - - -    ",
          )
        ).toMatchSnapshot()
      })
      it('example 25', () => {
        expect(
          scanMarkdown(
            "_ _ _ _ a",
            "",
            "a------",
            "",
            "---a---",
          )
        ).toMatchSnapshot()
      })
      it('example 26', () => {
        expect(
          scanMarkdown(
            " *-*",
          )
        ).toMatchSnapshot()
      })
      it('example 27', () => {
        expect(
          scanMarkdown(
            "- foo",
            "***",
            "- bar",
          )
        ).toMatchSnapshot()
      })
      it('example 28', () => {
        expect(
          scanMarkdown(
            "Foo",
            "***",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 29', () => {
        expect(
          scanMarkdown(
            "Foo",
            "---",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 30', () => {
        expect(
          scanMarkdown(
            "* Foo",
            "* * *",
            "* Bar",
          )
        ).toMatchSnapshot()
      })
      it('example 31', () => {
        expect(
          scanMarkdown(
            "- Foo",
            "- * * *",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.2 ATX headings', () => {
      it('example 32', () => {
        expect(
          scanMarkdown(
            "# foo",
            "## foo",
            "### foo",
            "#### foo",
            "##### foo",
            "###### foo",
          )
        ).toMatchSnapshot()
      })
      it('example 33', () => {
        expect(
          scanMarkdown(
            "####### foo",
          )
        ).toMatchSnapshot()
      })
      it('example 34', () => {
        expect(
          scanMarkdown(
            "#5 bolt",
            "",
            "#hashtag",
          )
        ).toMatchSnapshot()
      })
      it('example 35', () => {
        expect(
          scanMarkdown(
            "\\## foo",
          )
        ).toMatchSnapshot()
      })
      it('example 36', () => {
        expect(
          scanMarkdown(
            "# foo *bar* \\*baz\\*",
          )
        ).toMatchSnapshot()
      })
      it('example 37', () => {
        expect(
          scanMarkdown(
            "#                  foo                     ",
          )
        ).toMatchSnapshot()
      })
      it('example 38', () => {
        expect(
          scanMarkdown(
            " ### foo",
            "  ## foo",
            "   # foo",
          )
        ).toMatchSnapshot()
      })
      it('example 39', () => {
        expect(
          scanMarkdown(
            "    # foo",
          )
        ).toMatchSnapshot()
      })
      it('example 40', () => {
        expect(
          scanMarkdown(
            "foo",
            "    # bar",
          )
        ).toMatchSnapshot()
      })
      it('example 41', () => {
        expect(
          scanMarkdown(
            "## foo ##",
            "  ###   bar    ###",
          )
        ).toMatchSnapshot()
      })
      it('example 42', () => {
        expect(
          scanMarkdown(
            "# foo ##################################",
            "##### foo ##",
          )
        ).toMatchSnapshot()
      })
      it('example 43', () => {
        expect(
          scanMarkdown(
            "### foo ###     ",
          )
        ).toMatchSnapshot()
      })
      it('example 44', () => {
        expect(
          scanMarkdown(
            "### foo ### b",
          )
        ).toMatchSnapshot()
      })
      it('example 45', () => {
        expect(
          scanMarkdown(
            "# foo#",
          )
        ).toMatchSnapshot()
      })
      it('example 46', () => {
        expect(
          scanMarkdown(
            "### foo \\###",
            "## foo #\\##",
            "# foo \\#",
          )
        ).toMatchSnapshot()
      })
      it('example 47', () => {
        expect(
          scanMarkdown(
            "****",
            "## foo",
            "****",
          )
        ).toMatchSnapshot()
      })
      it('example 48', () => {
        expect(
          scanMarkdown(
            "Foo bar",
            "# baz",
            "Bar foo",
          )
        ).toMatchSnapshot()
      })
      it('example 49', () => {
        expect(
          scanMarkdown(
            "## ",
            "#",
            "### ###",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.3 Setext headings', () => {
      it('example 50', () => {
        expect(
          scanMarkdown(
            "Foo *bar*",
            "=========",
            "",
            "Foo *bar*",
            "---------",
          )
        ).toMatchSnapshot()
      })
      it('example 51', () => {
        expect(
          scanMarkdown(
            "Foo *bar",
            "baz*",
            "====",
          )
        ).toMatchSnapshot()
      })
      it('example 52', () => {
        expect(
          scanMarkdown(
            "Foo",
            "-------------------------",
            "",
            "Foo",
            "=",
          )
        ).toMatchSnapshot()
      })
      it('example 53', () => {
        expect(
          scanMarkdown(
            "   Foo",
            "---",
            "",
            "  Foo",
            "-----",
            "",
            "  Foo",
            "  ===",
          )
        ).toMatchSnapshot()
      })
      it('example 54', () => {
        expect(
          scanMarkdown(
            "    Foo",
            "    ---",
            "",
            "    Foo",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 55', () => {
        expect(
          scanMarkdown(
            "Foo",
            "   ----      ",
          )
        ).toMatchSnapshot()
      })
      it('example 56', () => {
        expect(
          scanMarkdown(
            "Foo",
            "    ---",
          )
        ).toMatchSnapshot()
      })
      it('example 57', () => {
        expect(
          scanMarkdown(
            "Foo",
            "= =",
            "",
            "Foo",
            "--- -",
          )
        ).toMatchSnapshot()
      })
      it('example 58', () => {
        expect(
          scanMarkdown(
            "Foo  ",
            "-----",
          )
        ).toMatchSnapshot()
      })
      it('example 59', () => {
        expect(
          scanMarkdown(
            "Foo\\",
            "----",
          )
        ).toMatchSnapshot()
      })
      it('example 60', () => {
        expect(
          scanMarkdown(
            "`Foo",
            "----",
            "`",
            "",
            "<a title=\"a lot",
            "---",
            "of dashes\"/>",
          )
        ).toMatchSnapshot()
      })
      it('example 61', () => {
        expect(
          scanMarkdown(
            "> Foo",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 62', () => {
        expect(
          scanMarkdown(
            "> foo",
            "bar",
            "===",
          )
        ).toMatchSnapshot()
      })
      it('example 63', () => {
        expect(
          scanMarkdown(
            "- Foo",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 64', () => {
        expect(
          scanMarkdown(
            "Foo",
            "Bar",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 65', () => {
        expect(
          scanMarkdown(
            "---",
            "Foo",
            "---",
            "Bar",
            "---",
            "Baz",
          )
        ).toMatchSnapshot()
      })
      it('example 66', () => {
        expect(
          scanMarkdown(
            "",
            "====",
          )
        ).toMatchSnapshot()
      })
      it('example 67', () => {
        expect(
          scanMarkdown(
            "---",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 68', () => {
        expect(
          scanMarkdown(
            "- foo",
            "-----",
          )
        ).toMatchSnapshot()
      })
      it('example 69', () => {
        expect(
          scanMarkdown(
            "    foo",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 70', () => {
        expect(
          scanMarkdown(
            "> foo",
            "-----",
          )
        ).toMatchSnapshot()
      })
      it('example 71', () => {
        expect(
          scanMarkdown(
            "\\> foo",
            "------",
          )
        ).toMatchSnapshot()
      })
      it('example 72', () => {
        expect(
          scanMarkdown(
            "Foo",
            "",
            "bar",
            "---",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 73', () => {
        expect(
          scanMarkdown(
            "Foo",
            "bar",
            "",
            "---",
            "",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 74', () => {
        expect(
          scanMarkdown(
            "Foo",
            "bar",
            "* * *",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 75', () => {
        expect(
          scanMarkdown(
            "Foo",
            "bar",
            "\\---",
            "baz",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.4 Indented code blocks', () => {
      it('example 76', () => {
        expect(
          scanMarkdown(
            "    a simple",
            "      indented code block",
          )
        ).toMatchSnapshot()
      })
      it('example 77', () => {
        expect(
          scanMarkdown(
            "  - foo",
            "",
            "    bar",
          )
        ).toMatchSnapshot()
      })
      it('example 78', () => {
        expect(
          scanMarkdown(
            "1.  foo",
            "",
            "    - bar",
          )
        ).toMatchSnapshot()
      })
      it('example 79', () => {
        expect(
          scanMarkdown(
            "    <a/>",
            "    *hi*",
            "",
            "    - one",
          )
        ).toMatchSnapshot()
      })
      it('example 80', () => {
        expect(
          scanMarkdown(
            "    chunk1",
            "",
            "    chunk2",
            "  ",
            " ",
            " ",
            "    chunk3",
          )
        ).toMatchSnapshot()
      })
      it('example 81', () => {
        expect(
          scanMarkdown(
            "    chunk1",
            "      ",
            "      chunk2",
          )
        ).toMatchSnapshot()
      })
      it('example 82', () => {
        expect(
          scanMarkdown(
            "Foo",
            "    bar",
            "",
          )
        ).toMatchSnapshot()
      })
      it('example 83', () => {
        expect(
          scanMarkdown(
            "    foo",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 84', () => {
        expect(
          scanMarkdown(
            "# Heading",
            "    foo",
            "Heading",
            "------",
            "    foo",
            "----",
          )
        ).toMatchSnapshot()
      })
      it('example 85', () => {
        expect(
          scanMarkdown(
            "        foo",
            "    bar",
          )
        ).toMatchSnapshot()
      })
      it('example 86', () => {
        expect(
          scanMarkdown(
            "",
            "    ",
            "    foo",
            "    ",
            "",
          )
        ).toMatchSnapshot()
      })
      it('example 87', () => {
        expect(
          scanMarkdown(
            "    foo  ",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.5 Fenced code blocks', () => {
      it('example 88', () => {
        expect(
          scanMarkdown(
            "```",
            "<",
            " >",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 89', () => {
        expect(
          scanMarkdown(
            "~~~",
            "<",
            " >",
            "~~~",
          )
        ).toMatchSnapshot()
      })
      it('example 90', () => {
        expect(
          scanMarkdown(
            "``",
            "foo",
            "``",
          )
        ).toMatchSnapshot()
      })
      it('example 91', () => {
        expect(
          scanMarkdown(
            "```",
            "aaa",
            "~~~",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 92', () => {
        expect(
          scanMarkdown(
            "~~~",
            "aaa",
            "```",
            "~~~",
          )
        ).toMatchSnapshot()
      })
      it('example 93', () => {
        expect(
          scanMarkdown(
            "````",
            "aaa",
            "```",
            "``````",
          )
        ).toMatchSnapshot()
      })
      it('example 94', () => {
        expect(
          scanMarkdown(
            "~~~~",
            "aaa",
            "~~~",
            "~~~~",
          )
        ).toMatchSnapshot()
      })
      it('example 95', () => {
        expect(
          scanMarkdown(
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 96', () => {
        expect(
          scanMarkdown(
            "`````",
            "",
            "```",
            "aaa",
          )
        ).toMatchSnapshot()
      })
      it('example 97', () => {
        expect(
          scanMarkdown(
            "> ```",
            "> aaa",
            "",
            "bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 98', () => {
        expect(
          scanMarkdown(
            "```",
            "",
            "  ",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 99', () => {
        expect(
          scanMarkdown(
            "```",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 100', () => {
        expect(
          scanMarkdown(
            " ```",
            " aaa",
            "aaa",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 101', () => {
        expect(
          scanMarkdown(
            "  ```",
            "aaa",
            "  aaa",
            "aaa",
            "  ```",
          )
        ).toMatchSnapshot()
      })
      it('example 102', () => {
        expect(
          scanMarkdown(
            "   ```",
            "   aaa",
            "    aaa",
            "  aaa",
            "   ```",
          )
        ).toMatchSnapshot()
      })
      it('example 103', () => {
        expect(
          scanMarkdown(
            "    ```",
            "    aaa",
            "    ```",
          )
        ).toMatchSnapshot()
      })
      it('example 104', () => {
        expect(
          scanMarkdown(
            "```",
            "aaa",
            "  ```",
          )
        ).toMatchSnapshot()
      })
      it('example 105', () => {
        expect(
          scanMarkdown(
            "   ```",
            "aaa",
            "  ```",
          )
        ).toMatchSnapshot()
      })
      it('example 106', () => {
        expect(
          scanMarkdown(
            "```",
            "aaa",
            "    ```",
          )
        ).toMatchSnapshot()
      })
      it('example 107', () => {
        expect(
          scanMarkdown(
            "``` ```",
            "aaa",
          )
        ).toMatchSnapshot()
      })
      it('example 108', () => {
        expect(
          scanMarkdown(
            "~~~~~~",
            "aaa",
            "~~~ ~~",
          )
        ).toMatchSnapshot()
      })
      it('example 109', () => {
        expect(
          scanMarkdown(
            "foo",
            "```",
            "bar",
            "```",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 110', () => {
        expect(
          scanMarkdown(
            "foo",
            "---",
            "~~~",
            "bar",
            "~~~",
            "# baz",
          )
        ).toMatchSnapshot()
      })
      it('example 111', () => {
        expect(
          scanMarkdown(
            "```ruby",
            "def foo(x)",
            "  return 3",
            "end",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 112', () => {
        expect(
          scanMarkdown(
            "~~~~    ruby startline=3 $%@#$",
            "def foo(x)",
            "  return 3",
            "end",
            "~~~~~~~",
          )
        ).toMatchSnapshot()
      })
      it('example 113', () => {
        expect(
          scanMarkdown(
            "````;",
            "````",
          )
        ).toMatchSnapshot()
      })
      it('example 114', () => {
        expect(
          scanMarkdown(
            "``` aa ```",
            "foo",
          )
        ).toMatchSnapshot()
      })
      it('example 115', () => {
        expect(
          scanMarkdown(
            "```",
            "``` aaa",
            "```",
          )
        ).toMatchSnapshot()
      })
    })
    // Will not support
    describe.skip('4.6 HTML blocks', () => {
      it('example 116', () => {
        expect(
          scanMarkdown(
            "<table><tr><td>",
            "<pre>",
            "**Hello**,",
            "",
            "_world_.",
            "</pre>",
            "</td></tr></table>",
          )
        ).toMatchSnapshot()
      })
      it('example 117', () => {
        expect(
          scanMarkdown(
            "<table>",
            "  <tr>",
            "    <td>",
            "           hi",
            "    </td>",
            "  </tr>",
            "</table>",
            "",
            "okay.",
          )
        ).toMatchSnapshot()
      })
      it('example 118', () => {
        expect(
          scanMarkdown(
            " <div>",
            "  *hello*",
            "         <foo><a>",
          )
        ).toMatchSnapshot()
      })
      it('example 119', () => {
        expect(
          scanMarkdown(
            "</div>",
            "*foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 120', () => {
        expect(
          scanMarkdown(
            "<DIV CLASS=\"foo\">",
            "",
            "*Markdown*",
            "",
            "</DIV>",
          )
        ).toMatchSnapshot()
      })
      it('example 121', () => {
        expect(
          scanMarkdown(
            "<div id=\"foo\"",
            "  class=\"bar\">",
            "</div>",
          )
        ).toMatchSnapshot()
      })
      it('example 122', () => {
        expect(
          scanMarkdown(
            "<div id=\"foo\" class=\"bar",
            "  baz\">",
            "</div>",
          )
        ).toMatchSnapshot()
      })
      it('example 123', () => {
        expect(
          scanMarkdown(
            "<div>",
            "*foo*",
            "",
            "*bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 124', () => {
        expect(
          scanMarkdown(
            "<div id=\"foo\"",
            "*hi*",
          )
        ).toMatchSnapshot()
      })
      it('example 125', () => {
        expect(
          scanMarkdown(
            "<div class",
            "foo",
          )
        ).toMatchSnapshot()
      })
      it('example 126', () => {
        expect(
          scanMarkdown(
            "<div *???-&&&-<---",
            "*foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 127', () => {
        expect(
          scanMarkdown(
            "<div><a href=\"bar\">*foo*</a></div>",
          )
        ).toMatchSnapshot()
      })
      it('example 128', () => {
        expect(
          scanMarkdown(
            "<table><tr><td>",
            "foo",
            "</td></tr></table>",
          )
        ).toMatchSnapshot()
      })
      it('example 129', () => {
        expect(
          scanMarkdown(
            "<div></div>",
            "``` c",
            "int x = 33;",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 130', () => {
        expect(
          scanMarkdown(
            "<a href=\"foo\">",
            "*bar*",
            "</a>",
          )
        ).toMatchSnapshot()
      })
      it('example 131', () => {
        expect(
          scanMarkdown(
            "<Warning>",
            "*bar*",
            "</Warning>",
          )
        ).toMatchSnapshot()
      })
      it('example 132', () => {
        expect(
          scanMarkdown(
            "<i class=\"foo\">",
            "*bar*",
            "</i>",
          )
        ).toMatchSnapshot()
      })
      it('example 133', () => {
        expect(
          scanMarkdown(
            "</ins>",
            "*bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 134', () => {
        expect(
          scanMarkdown(
            "<del>",
            "*foo*",
            "</del>",
          )
        ).toMatchSnapshot()
      })
      it('example 135', () => {
        expect(
          scanMarkdown(
            "<del>",
            "",
            "*foo*",
            "",
            "</del>",
          )
        ).toMatchSnapshot()
      })
      it('example 136', () => {
        expect(
          scanMarkdown(
            "<del>*foo*</del>",
          )
        ).toMatchSnapshot()
      })
      it('example 137', () => {
        expect(
          scanMarkdown(
            "<pre language=\"haskell\"><code>",
            "import Text.HTML.TagSoup",
            "",
            "main :: IO ()",
            "main = print $ parseTags tags",
            "</code></pre>",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 138', () => {
        expect(
          scanMarkdown(
            "<script type=\"text/javascript\">",
            "// JavaScript example",
            "",
            "document.getElementById(\"demo\").innerHTML = \"Hello JavaScript!\";",
            "</script>",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 139', () => {
        expect(
          scanMarkdown(
            "<style",
            "  type=\"text/css\">",
            "h1 {color:red;}",
            "",
            "p {color:blue;}",
            "</style>",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 140', () => {
        expect(
          scanMarkdown(
            "<style",
            "  type=\"text/css\">",
            "",
            "foo",
          )
        ).toMatchSnapshot()
      })
      it('example 141', () => {
        expect(
          scanMarkdown(
            "> <div>",
            "> foo",
            "",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 142', () => {
        expect(
          scanMarkdown(
            "- <div>",
            "- foo",
          )
        ).toMatchSnapshot()
      })
      it('example 143', () => {
        expect(
          scanMarkdown(
            "<style>p{color:red;}</style>",
            "*foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 144', () => {
        expect(
          scanMarkdown(
            "<!-- foo -->*bar*",
            "*baz*",
          )
        ).toMatchSnapshot()
      })
      it('example 145', () => {
        expect(
          scanMarkdown(
            "<script>",
            "foo",
            "</script>1. *bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 146', () => {
        expect(
          scanMarkdown(
            "<!-- Foo",
            "",
            "bar",
            "   baz -->",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 147', () => {
        expect(
          scanMarkdown(
            "<?php",
            "",
            "  echo '>';",
            "",
            "?>",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 148', () => {
        expect(
          scanMarkdown(
            "<!DOCTYPE html>",
          )
        ).toMatchSnapshot()
      })
      it('example 149', () => {
        expect(
          scanMarkdown(
            "<![CDATA[",
            "function matchwo(a,b)",
            "{",
            "  if (a < b && a < 0) then {",
            "    return 1;",
            "",
            "  } else {",
            "",
            "    return 0;",
            "  }",
            "}",
            "]]>",
            "okay",
          )
        ).toMatchSnapshot()
      })
      it('example 150', () => {
        expect(
          scanMarkdown(
            "  <!-- foo -->",
            "",
            "    <!-- foo -->",
          )
        ).toMatchSnapshot()
      })
      it('example 151', () => {
        expect(
          scanMarkdown(
            "  <div>",
            "",
            "    <div>",
          )
        ).toMatchSnapshot()
      })
      it('example 152', () => {
        expect(
          scanMarkdown(
            "Foo",
            "<div>",
            "bar",
            "</div>",
          )
        ).toMatchSnapshot()
      })
      it('example 153', () => {
        expect(
          scanMarkdown(
            "<div>",
            "bar",
            "</div>",
            "*foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 154', () => {
        expect(
          scanMarkdown(
            "Foo",
            "<a href=\"bar\">",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 155', () => {
        expect(
          scanMarkdown(
            "<div>",
            "",
            "*Emphasized* text.",
            "",
            "</div>",
          )
        ).toMatchSnapshot()
      })
      it('example 156', () => {
        expect(
          scanMarkdown(
            "<div>",
            "*Emphasized* text.",
            "</div>",
          )
        ).toMatchSnapshot()
      })
      it('example 157', () => {
        expect(
          scanMarkdown(
            "<table>",
            "",
            "<tr>",
            "",
            "<td>",
            "Hi",
            "</td>",
            "",
            "</tr>",
            "",
            "</table>",
          )
        ).toMatchSnapshot()
      })
      it('example 158', () => {
        expect(
          scanMarkdown(
            "<table>",
            "",
            "  <tr>",
            "",
            "    <td>",
            "      Hi",
            "    </td>",
            "",
            "  </tr>",
            "",
            "</table>",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.7 Link reference definitions', () => {
      // BUG: symbol name cannot be correctly marked as editable text,
      //      for modifing only one of its occurance will change the tree.
      //      Terminology:
      //      * Def site - [foo]: url
      //      * Ref site - [foo]
      //      * Symbol - foo
      //      What can be observed:
      //      1. Url changing can be correctly correlated
      //      2. Changes to Ref cause an <a /> node to be deleted
      //      3. Changes to symbol part at def site cause the node to be deleted 
      //      4. <a />.text === symbol name
      it('example 159', () => {
        // NOTE:
            // "[foo]: /url \"title\"",
            // "x", <- insert-tree
            // "[foo]",
        expect(
          scanMarkdown(
            "[foo]: /url \"title\"",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 160', () => {
        expect(
          scanMarkdown(
            "   [foo]: ",
            "      /url  ",
            "           'the title'  ",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 161', () => {
        expect(
          scanMarkdown(
            "[Foo*bar\\]]:my_(url) 'title (with parens)'",
            "",
            "[Foo*bar\\]]",
          )
        ).toMatchSnapshot()
      })
      it('example 162', () => {
        expect(
          scanMarkdown(
            "[Foo bar]:",
            "<my%20url>",
            "'title'",
            "",
            "[Foo bar]",
          )
        ).toMatchSnapshot()
      })
      it('example 163', () => {
        expect(
          scanMarkdown(
            "[foo]: /url '",
            "title",
            "line1",
            "line2",
            "'",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 164', () => {
        expect(
          scanMarkdown(
            "[foo]: /url 'title",
            "",
            "with blank line'",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 165', () => {
        expect(
          scanMarkdown(
            "[foo]:",
            "/url",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 166', () => {
        expect(
          scanMarkdown(
            "[foo]:",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 167', () => {
        expect(
          scanMarkdown(
            "[foo]: /url\\bar\\*baz \"foo\\\"bar\\baz\"",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 168', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "[foo]: url",
          )
        ).toMatchSnapshot()
      })
      it('example 169', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "[foo]: first",
            "[foo]: second",
          )
        ).toMatchSnapshot()
      })
      it('example 170', () => {
        expect(
          scanMarkdown(
            "[FOO]: /url",
            "",
            "[Foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 171', () => {
        expect(
          scanMarkdown(
            "[ΑΓΩ]: /φου",
            "",
            "[αγω]",
          )
        ).toMatchSnapshot()
      })
      it('example 172', () => {
        expect(
          scanMarkdown(
            "[foo]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 173', () => {
        expect(
          scanMarkdown(
            "[",
            "foo",
            "]: /url",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 174', () => {
        expect(
          scanMarkdown(
            "[foo]: /url \"title\" ok",
          )
        ).toMatchSnapshot()
      })
      it('example 175', () => {
        expect(
          scanMarkdown(
            "[foo]: /url",
            "\"title\" ok",
          )
        ).toMatchSnapshot()
      })
      it('example 176', () => {
        expect(
          scanMarkdown(
            "    [foo]: /url \"title\"",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 177', () => {
        expect(
          scanMarkdown(
            "```",
            "[foo]: /url",
            "```",
            "",
            "[foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 178', () => {
        expect(
          scanMarkdown(
            "Foo",
            "[bar]: /baz",
            "",
            "[bar]",
          )
        ).toMatchSnapshot()
      })
      it('example 179', () => {
        expect(
          scanMarkdown(
            "# [Foo]",
            "[foo]: /url",
            "> bar",
          )
        ).toMatchSnapshot()
      })
      it('example 180', () => {
        expect(
          scanMarkdown(
            "[foo]: /foo-url \"foo\"",
            "[bar]: /bar-url",
            "  \"bar\"",
            "[baz]: /baz-url",
            "",
            "[foo],",
            "[bar],",
            "[baz]",
          )
        ).toMatchSnapshot()
      })
      it('example 181', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "> [foo]: /url",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.8 Paragraphs', () => {
      it('example 182', () => {
        expect(
          scanMarkdown(
            "aaa",
            "",
            "bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 183', () => {
        expect(
          scanMarkdown(
            "aaa",
            "bbb",
            "",
            "ccc",
            "ddd",
          )
        ).toMatchSnapshot()
      })
      it('example 184', () => {
        expect(
          scanMarkdown(
            "aaa",
            "",
            "",
            "bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 185', () => {
        expect(
          scanMarkdown(
            "  aaa",
            " bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 186', () => {
        expect(
          scanMarkdown(
            "aaa",
            "             bbb",
            "                                       ccc",
          )
        ).toMatchSnapshot()
      })
      it('example 187', () => {
        expect(
          scanMarkdown(
            "   aaa",
            "bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 188', () => {
        expect(
          scanMarkdown(
            "    aaa",
            "bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 189', () => {
        expect(
          scanMarkdown(
            "aaa     ",
            "bbb     ",
          )
        ).toMatchSnapshot()
      })
    })
    describe('4.9 Blank lines', () => {
      it('example 190', () => {
        expect(
          // BUG: blank lines don't have corrsponding VNode. Modifiying one will cause tree change.
          //      They will be incorrectly marked as uneditable.
          //      Possible solution: placeholder, normalization.
          scanMarkdown(
            "  ",
            "",
            "aaa",
            "  ",
            "",
            "# aaa",
            "",
            "  ",
          )
        ).toMatchSnapshot()
      })
    })
  })
  describe('5 Container blocks', () => {
    describe('5.1 Block quotes', () => {
      it('example 191', () => {
        // BUG: false negative
        // input:
        // "> # Foo",
        // "> bar",
        // "x baz",
        // yields only simple update-text
        // need 2nd order scanning 
        expect(
          scanMarkdown(
            "> # Foo",
            "> bar",
            "> baz",
          )
        ).toMatchSnapshot()
      })
      it('example 192', () => {
        expect(
          scanMarkdown(
            "># Foo",
            ">bar",
            "> baz",
          )
        ).toMatchSnapshot()
      })
      it('example 193', () => {
        expect(
          scanMarkdown(
            "   > # Foo",
            "   > bar",
            " > baz",
          )
        ).toMatchSnapshot()
      })
      it('example 194', () => {
        expect(
          scanMarkdown(
            "    > # Foo",
            "    > bar",
            "    > baz",
          )
        ).toMatchSnapshot()
      })
      it('example 195', () => {
        expect(
          scanMarkdown(
            "> # Foo",
            "> bar",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 196', () => {
        expect(
          scanMarkdown(
            "> bar",
            "baz",
            "> foo",
          )
        ).toMatchSnapshot()
      })
      it('example 197', () => {
        expect(
          scanMarkdown(
            "> foo",
            "---",
          )
        ).toMatchSnapshot()
      })
      it('example 198', () => {
        expect(
          scanMarkdown(
            "> - foo",
            "- bar",
          )
        ).toMatchSnapshot()
      })
      it('example 199', () => {
        expect(
          scanMarkdown(
            ">     foo",
            "    bar",
          )
        ).toMatchSnapshot()
      })
      it('example 200', () => {
        expect(
          scanMarkdown(
            "> ```",
            "foo",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 201', () => {
        expect(
          scanMarkdown(
            "> foo",
            "    - bar",
          )
        ).toMatchSnapshot()
      })
      it('example 202', () => {
        expect(
          scanMarkdown(
            ">",
          )
        ).toMatchSnapshot()
      })
      it('example 203', () => {
        expect(
          // BUG: lazy continuation will cause bug here. No diffs will be emitted.
          scanMarkdown(
            ">",
            ">  ",
            "> ",
          )
        ).toMatchSnapshot()
      })
      it('example 204', () => {
        expect(
          scanMarkdown(
            ">",
            "> foo",
            ">  ",
          )
        ).toMatchSnapshot()
      })
      it('example 205', () => {
        expect(
          scanMarkdown(
            "> foo",
            "",
            "> bar",
          )
        ).toMatchSnapshot()
      })
      it('example 206', () => {
        expect(
          scanMarkdown(
            "> foo",
            "> bar",
          )
        ).toMatchSnapshot()
      })
      it('example 207', () => {
        expect(
          scanMarkdown(
            "> foo",
            ">",
            "> bar",
          )
        ).toMatchSnapshot()
      })
      it('example 208', () => {
        expect(
          scanMarkdown(
            "foo",
            "> bar",
          )
        ).toMatchSnapshot()
      })
      it('example 209', () => {
        expect(
          scanMarkdown(
            "> aaa",
            "***",
            "> bbb",
          )
        ).toMatchSnapshot()
      })
      it('example 210', () => {
        expect(
          scanMarkdown(
            "> bar",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 211', () => {
        expect(
          scanMarkdown(
            "> bar",
            "",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 212', () => {
        expect(
          scanMarkdown(
            "> bar",
            ">",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 213', () => {
        expect(
          scanMarkdown(
            "> > > foo",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 214', () => {
        expect(
          scanMarkdown(
            ">>> foo",
            "> bar",
            ">>baz",
          )
        ).toMatchSnapshot()
      })
      it('example 215', () => {
        expect(
          scanMarkdown(
            ">     code",
            "",
            ">    not code",
          )
        ).toMatchSnapshot()
      })
    })
    describe('5.2 List items', () => {
      it('example 216', () => {
        expect(
          scanMarkdown(
            "A paragraph",
            "with two lines.",
            "",
            "    indented code",
            "",
            "> A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 217', () => {
        expect(
          scanMarkdown(
            "1.  A paragraph",
            "    with two lines.",
            "",
            "        indented code",
            "",
            "    > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 218', () => {
        expect(
          scanMarkdown(
            "- one",
            "",
            " two",
          )
        ).toMatchSnapshot()
      })
      it('example 219', () => {
        expect(
          scanMarkdown(
            "- one",
            "",
            "  two",
          )
        ).toMatchSnapshot()
      })
      it('example 220', () => {
        expect(
          scanMarkdown(
            " -    one",
            "",
            "     two",
          )
        ).toMatchSnapshot()
      })
      it('example 221', () => {
        expect(
          scanMarkdown(
            " -    one",
            "",
            "      two",
          )
        ).toMatchSnapshot()
      })
      it('example 222', () => {
        expect(
          scanMarkdown(
            "   > > 1.  one",
            ">>",
            ">>     two",
          )
        ).toMatchSnapshot()
      })
      it('example 223', () => {
        expect(
          scanMarkdown(
            ">>- one",
            ">>",
            "  >  > two",
          )
        ).toMatchSnapshot()
      })
      it('example 224', () => {
        expect(
          scanMarkdown(
            "-one",
            "",
            "2.two",
          )
        ).toMatchSnapshot()
      })
      it('example 225', () => {
        expect(
          scanMarkdown(
            "- foo",
            "",
            "",
            "  bar",
          )
        ).toMatchSnapshot()
      })
      it('example 226', () => {
        expect(
          scanMarkdown(
            "1.  foo",
            "",
            "    ```",
            "    bar",
            "    ```",
            "",
            "    baz",
            "",
            "    > bam",
          )
        ).toMatchSnapshot()
      })
      it('example 227', () => {
        expect(
          scanMarkdown(
            "- Foo",
            "",
            "      bar",
            "",
            "",
            "      baz",
          )
        ).toMatchSnapshot()
      })
      it('example 228', () => {
        expect(
          scanMarkdown(
            "123456789. ok",
          )
        ).toMatchSnapshot()
      })
      it('example 229', () => {
        expect(
          scanMarkdown(
            "1234567890. not ok",
          )
        ).toMatchSnapshot()
      })
      it('example 230', () => {
        expect(
          scanMarkdown(
            "0. ok",
          )
        ).toMatchSnapshot()
      })
      it('example 231', () => {
        expect(
          scanMarkdown(
            "003. ok",
          )
        ).toMatchSnapshot()
      })
      it('example 232', () => {
        expect(
          scanMarkdown(
            "-1. not ok",
          )
        ).toMatchSnapshot()
      })
      it('example 233', () => {
        expect(
          scanMarkdown(
            "- foo",
            "",
            "      bar",
          )
        ).toMatchSnapshot()
      })
      it('example 234', () => {
        expect(
          scanMarkdown(
            "  10.  foo",
            "",
            "           bar",
          )
        ).toMatchSnapshot()
      })
      it('example 235', () => {
        // BUG: insert-before constraint violation: before node is in pending tree
        //      correctness of the result doen't seems to be affected.
        // NOTE: generated diff can be reduced
        expect(
          scanMarkdown(
            "    indented code",
            "",
            "paragraph",
            "",
            "    more code",
          )
        ).toMatchSnapshot()
      })
      it('example 236', () => {
        expect(
          scanMarkdown(
            "1.     indented code",
            "",
            "   paragraph",
            "",
            "       more code",
          )
        ).toMatchSnapshot()
      })
      it('example 237', () => {
        expect(
          scanMarkdown(
            "1.      indented code",
            "",
            "   paragraph",
            "",
            "       more code",
          )
        ).toMatchSnapshot()
      })
      it('example 238', () => {
        expect(
          scanMarkdown(
            "   foo",
            "",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 239', () => {
        expect(
          scanMarkdown(
            "-    foo",
            "",
            "  bar",
          )
        ).toMatchSnapshot()
      })
      it('example 240', () => {
        expect(
          scanMarkdown(
            "-  foo",
            "",
            "   bar",
          )
        ).toMatchSnapshot()
      })
      it('example 241', () => {
        // BUG: closing token for fence not detected at end of parent container
        expect(
          scanMarkdown(
            "-",
            "  foo",
            "-",
            "  ```",
            "  bar",
            "  ```",
            "-",
            "      baz",
          )
        ).toMatchSnapshot()
      })
      it('example 242', () => {
        expect(
          scanMarkdown(
            "-   ",
            "  foo",
          )
        ).toMatchSnapshot()
      })
      it('example 243', () => {
        expect(
          scanMarkdown(
            "-",
            "",
            "  foo",
          )
        ).toMatchSnapshot()
      })
      it('example 244', () => {
        expect(
          scanMarkdown(
            "- foo",
            "-",
            "- bar",
          )
        ).toMatchSnapshot()
      })
      it('example 245', () => {
        expect(
          scanMarkdown(
            "- foo",
            "-   ",
            "- bar",
          )
        ).toMatchSnapshot()
      })
      it('example 246', () => {
        expect(
          scanMarkdown(
            "1. foo",
            "2.",
            "3. bar",
          )
        ).toMatchSnapshot()
      })
      it('example 247', () => {
        expect(
          scanMarkdown(
            "*",
          )
        ).toMatchSnapshot()
      })
      it('example 248', () => {
        expect(
          scanMarkdown(
            "foo",
            "*",
            "",
            "foo",
            "1.",
          )
        ).toMatchSnapshot()
      })
      it('example 249', () => {
        expect(
          scanMarkdown(
            " 1.  A paragraph",
            "     with two lines.",
            "",
            "         indented code",
            "",
            "     > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 250', () => {
        expect(
          scanMarkdown(
            "  1.  A paragraph",
            "      with two lines.",
            "",
            "          indented code",
            "",
            "      > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 251', () => {
        expect(
          scanMarkdown(
            "   1.  A paragraph",
            "       with two lines.",
            "",
            "           indented code",
            "",
            "       > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 252', () => {
        expect(
          scanMarkdown(
            "    1.  A paragraph",
            "        with two lines.",
            "",
            "            indented code",
            "",
            "        > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 253', () => {
        expect(
          scanMarkdown(
            "  1.  A paragraph",
            "with two lines.",
            "",
            "          indented code",
            "",
            "      > A block quote.",
          )
        ).toMatchSnapshot()
      })
      it('example 254', () => {
        expect(
          scanMarkdown(
            "  1.  A paragraph",
            "    with two lines.",
          )
        ).toMatchSnapshot()
      })
      it('example 255', () => {
        expect(
          scanMarkdown(
            "> 1. > Blockquote",
            "continued here.",
          )
        ).toMatchSnapshot()
      })
      it('example 256', () => {
        expect(
          scanMarkdown(
            "> 1. > Blockquote",
            "> continued here.",
          )
        ).toMatchSnapshot()
      })
      it('example 257', () => {
        expect(
          scanMarkdown(
            "- foo",
            "  - bar",
            "    - baz",
            "      - boo",
          )
        ).toMatchSnapshot()
      })
      it('example 258', () => {
        expect(
          scanMarkdown(
            "- foo",
            " - bar",
            "  - baz",
            "   - boo",
          )
        ).toMatchSnapshot()
      })
      it('example 259', () => {
        expect(
          scanMarkdown(
            "10) foo",
            "    - bar",
          )
        ).toMatchSnapshot()
      })
      it('example 260', () => {
        expect(
          scanMarkdown(
            "10) foo",
            "   - bar",
          )
        ).toMatchSnapshot()
      })
      it('example 261', () => {
        expect(
          scanMarkdown(
            "- - foo",
          )
        ).toMatchSnapshot()
      })
      it('example 262', () => {
        expect(
          scanMarkdown(
            "1. - 2. foo",
          )
        ).toMatchSnapshot()
      })
      it('example 263', () => {
        expect(
          scanMarkdown(
            "- # Foo",
            "- Bar",
            "  ---",
            "  baz",
          )
        ).toMatchSnapshot()
      })
    })
    describe('5.3 Lists', () => {
      it('example 264', () => {
        expect(
          scanMarkdown(
            "- foo",
            "- bar",
            "+ baz",
          )
        ).toMatchSnapshot()
      })
      it('example 265', () => {
        expect(
          scanMarkdown(
            "1. foo",
            "2. bar",
            "3) baz",
          )
        ).toMatchSnapshot()
      })
      it('example 266', () => {
        expect(
          scanMarkdown(
            "Foo",
            "- bar",
            "- baz",
          )
        ).toMatchSnapshot()
      })
      it('example 267', () => {
        expect(
          scanMarkdown(
            "The number of windows in my house is",
            "14.  The number of doors is 6.",
          )
        ).toMatchSnapshot()
      })
      it('example 268', () => {
        expect(
          scanMarkdown(
            "The number of windows in my house is",
            "1.  The number of doors is 6.",
          )
        ).toMatchSnapshot()
      })
      it('example 269', () => {
        expect(
          scanMarkdown(
            "- foo",
            "",
            "- bar",
            "",
            "",
            "- baz",
          )
        ).toMatchSnapshot()
      })
      it('example 270', () => {
        expect(
          scanMarkdown(
            "- foo",
            "  - bar",
            "    - baz",
            "",
            "",
            "      bim",
          )
        ).toMatchSnapshot()
      })
      it('example 271', () => {
        expect(
          scanMarkdown(
            "- foo",
            "- bar",
            "",
            "<!-- -->",
            "",
            "- baz",
            "- bim",
          )
        ).toMatchSnapshot()
      })
      it('example 272', () => {
        expect(
          scanMarkdown(
            "-   foo",
            "",
            "    notcode",
            "",
            "-   foo",
            "",
            "<!-- -->",
            "",
            "    code",
          )
        ).toMatchSnapshot()
      })
      it('example 273', () => {
        expect(
          scanMarkdown(
            "- a",
            " - b",
            "  - c",
            "   - d",
            "    - e",
            "   - f",
            "  - g",
            " - h",
            "- i",
          )
        ).toMatchSnapshot()
      })
      it('example 274', () => {
        expect(
          scanMarkdown(
            "1. a",
            "",
            "  2. b",
            "",
            "    3. c",
          )
        ).toMatchSnapshot()
      })
      it('example 275', () => {
        expect(
          scanMarkdown(
            "- a",
            "- b",
            "",
            "- c",
          )
        ).toMatchSnapshot()
      })
      it('example 276', () => {
        expect(
          scanMarkdown(
            "* a",
            "*",
            "",
            "* c",
          )
        ).toMatchSnapshot()
      })
      it('example 277', () => {
        expect(
          scanMarkdown(
            "- a",
            "- b",
            "",
            "  c",
            "- d",
          )
        ).toMatchSnapshot()
      })
      it('example 278', () => {
        expect(
          scanMarkdown(
            "- a",
            "- b",
            "",
            "  [ref]: /url",
            "- d",
          )
        ).toMatchSnapshot()
      })
      it('example 279', () => {
        expect(
          scanMarkdown(
            "- a",
            "- ```",
            "  b",
            "",
            "",
            "  ```",
            "- c",
          )
        ).toMatchSnapshot()
      })
      it('example 280', () => {
        expect(
          scanMarkdown(
            "- a",
            "  - b",
            "",
            "    c",
            "- d",
          )
        ).toMatchSnapshot()
      })
      it('example 281', () => {
        expect(
          scanMarkdown(
            "* a",
            "  > b",
            "  >",
            "* c",
          )
        ).toMatchSnapshot()
      })
      it('example 282', () => {
        expect(
          scanMarkdown(
            "- a",
            "  > b",
            "  ```",
            "  c",
            "  ```",
            "- d",
          )
        ).toMatchSnapshot()
      })
      it('example 283', () => {
        expect(
          scanMarkdown(
            "- a",
          )
        ).toMatchSnapshot()
      })
      it('example 284', () => {
        expect(
          scanMarkdown(
            "- a",
            "  - b",
          )
        ).toMatchSnapshot()
      })
      it('example 285', () => {
        expect(
          scanMarkdown(
            "1. ```",
            "   foo",
            "   ```",
            "",
            "   bar",
          )
        ).toMatchSnapshot()
      })
      it('example 286', () => {
        expect(
          scanMarkdown(
            "* foo",
            "  * bar",
            "",
            "  baz",
          )
        ).toMatchSnapshot()
      })
      it('example 287', () => {
        expect(
          scanMarkdown(
            "- a",
            "  - b",
            "  - c",
            "",
            "- d",
            "  - e",
            "  - f",
          )
        ).toMatchSnapshot()
      })
    })
  })
  describe('6 Inlines', () => {
    describe('6.0 Lists', () => {
      it('example 288', () => {
        expect(
          scanMarkdown(
            "`hi`lo`",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.1 Backslash escapes', () => {
      it('example 289', () => {
        expect(
          scanMarkdown(
            "\\!\\\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~",
          )
        ).toMatchSnapshot()
      })
      it('example 290', () => {
        expect(
          scanMarkdown(
            "\\\t\\A\\a\\ \\3\\φ\\«",
          )
        ).toMatchSnapshot()
      })
      it('example 291', () => {
        expect(
          scanMarkdown(
            "\\*not emphasized*",
            "\\<br/> not a tag",
            "\\[not a link](/foo)",
            "\\`not code`",
            "1\\. not a list",
            "\\* not a list",
            "\\# not a heading",
            "\\[foo]: /url \"not a reference\"",
          )
        ).toMatchSnapshot()
      })
      it('example 292', () => {
        expect(
          scanMarkdown(
            "\\\\*emphasis*",
          )
        ).toMatchSnapshot()
      })
      it('example 293', () => {
        expect(
          scanMarkdown(
            "foo\\",
            "bar",
          )
        ).toMatchSnapshot()
      })
      it('example 294', () => {
        expect(
          scanMarkdown(
            "`` \\[\\` ``",
          )
        ).toMatchSnapshot()
      })
      it('example 295', () => {
        expect(
          scanMarkdown(
            "    \\[\\]",
          )
        ).toMatchSnapshot()
      })
      it('example 296', () => {
        expect(
          scanMarkdown(
            "~~~",
            "\\[\\]",
            "~~~",
          )
        ).toMatchSnapshot()
      })
      it('example 297', () => {
        expect(
          scanMarkdown(
            "<http://example.com?find=\\*>",
          )
        ).toMatchSnapshot()
      })
      it('example 298', () => {
        expect(
          scanMarkdown(
            "<a href=\"/bar\\/)\">",
          )
        ).toMatchSnapshot()
      })
      it('example 299', () => {
        expect(
          scanMarkdown(
            "[foo](/bar\\* \"ti\\*tle\")",
          )
        ).toMatchSnapshot()
      })
      it('example 300', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "[foo]: /bar\\* \"ti\\*tle\"",
          )
        ).toMatchSnapshot()
      })
      it('example 301', () => {
        expect(
          scanMarkdown(
            "``` foo\\+bar",
            "foo",
            "```",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.2 Entity and numeric character references', () => {
      it('example 302', () => {
        expect(
          scanMarkdown(
            "&nbsp; &amp; &copy; &AElig; &Dcaron;",
            "&frac34; &HilbertSpace; &DifferentialD;",
            "&ClockwiseContourIntegral; &ngE;",
          )
        ).toMatchSnapshot()
      })
      it('example 303', () => {
        expect(
          scanMarkdown(
            "&#35; &#1234; &#992; &#98765432; &#0;",
          )
        ).toMatchSnapshot()
      })
      it('example 304', () => {
        expect(
          scanMarkdown(
            "&#X22; &#XD06; &#xcab;",
          )
        ).toMatchSnapshot()
      })
      it('example 305', () => {
        expect(
          scanMarkdown(
            "&nbsp &x; &#; &#x;",
            "&ThisIsNotDefined; &hi?;",
          )
        ).toMatchSnapshot()
      })
      it('example 306', () => {
        expect(
          scanMarkdown(
            "&copy",
          )
        ).toMatchSnapshot()
      })
      it('example 307', () => {
        expect(
          scanMarkdown(
            "&MadeUpEntity;",
          )
        ).toMatchSnapshot()
      })
      it('example 308', () => {
        expect(
          scanMarkdown(
            "<a href=\"&ouml;&ouml;.html\">",
          )
        ).toMatchSnapshot()
      })
      it('example 309', () => {
        expect(
          scanMarkdown(
            "[foo](/f&ouml;&ouml; \"f&ouml;&ouml;\")",
          )
        ).toMatchSnapshot()
      })
      it('example 310', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "[foo]: /f&ouml;&ouml; \"f&ouml;&ouml;\"",
          )
        ).toMatchSnapshot()
      })
      it('example 311', () => {
        expect(
          scanMarkdown(
            "``` f&ouml;&ouml;",
            "foo",
            "```",
          )
        ).toMatchSnapshot()
      })
      it('example 312', () => {
        expect(
          scanMarkdown(
            "`f&ouml;&ouml;`",
          )
        ).toMatchSnapshot()
      })
      it('example 313', () => {
        expect(
          scanMarkdown(
            "    f&ouml;f&ouml;",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.3 Code spans', () => {
      it('example 314', () => {
        expect(
          scanMarkdown(
            "`foo`",
          )
        ).toMatchSnapshot()
      })
      it('example 315', () => {
        expect(
          scanMarkdown(
            "`` foo ` bar  ``",
          )
        ).toMatchSnapshot()
      })
      it('example 316', () => {
        expect(
          scanMarkdown(
            "` `` `",
          )
        ).toMatchSnapshot()
      })
      it('example 317', () => {
        expect(
          scanMarkdown(
            "``",
            "foo",
            "``",
          )
        ).toMatchSnapshot()
      })
      it('example 318', () => {
        expect(
          scanMarkdown(
            "`foo   bar",
            "  baz`",
          )
        ).toMatchSnapshot()
      })
      it('example 319', () => {
        expect(
          scanMarkdown(
            "`a  b`",
          )
        ).toMatchSnapshot()
      })
      it('example 320', () => {
        expect(
          scanMarkdown(
            "`foo `` bar`",
          )
        ).toMatchSnapshot()
      })
      it('example 321', () => {
        expect(
          scanMarkdown(
            "`foo\\`bar`",
          )
        ).toMatchSnapshot()
      })
      it('example 322', () => {
        expect(
          scanMarkdown(
            "*foo`*`",
          )
        ).toMatchSnapshot()
      })
      it('example 323', () => {
        expect(
          scanMarkdown(
            "[not a `link](/foo`)",
          )
        ).toMatchSnapshot()
      })
      it('example 324', () => {
        expect(
          scanMarkdown(
            "`<a href=\"`\">`",
          )
        ).toMatchSnapshot()
      })
      it('example 325', () => {
        expect(
          scanMarkdown(
            "<a href=\"`\">`",
          )
        ).toMatchSnapshot()
      })
      it('example 326', () => {
        expect(
          scanMarkdown(
            "`<http://foo.bar.`baz>`",
          )
        ).toMatchSnapshot()
      })
      it('example 327', () => {
        expect(
          scanMarkdown(
            "<http://foo.bar.`baz>`",
          )
        ).toMatchSnapshot()
      })
      it('example 328', () => {
        expect(
          scanMarkdown(
            "```foo``",
          )
        ).toMatchSnapshot()
      })
      it('example 329', () => {
        expect(
          scanMarkdown(
            "`foo",
          )
        ).toMatchSnapshot()
      })
      it('example 330', () => {
        expect(
          scanMarkdown(
            "`foo``bar``",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.4 Emphasis and strong emphasis', () => {
      it('example 331', () => {
        expect(
          scanMarkdown(
            "*foo bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 332', () => {
        expect(
          scanMarkdown(
            "a * foo bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 333', () => {
        expect(
          scanMarkdown(
            "a*\"foo\"*",
          )
        ).toMatchSnapshot()
      })
      it('example 334', () => {
        expect(
          scanMarkdown(
            "* a *",
          )
        ).toMatchSnapshot()
      })
      it('example 335', () => {
        expect(
          scanMarkdown(
            "foo*bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 336', () => {
        expect(
          scanMarkdown(
            "5*6*78",
          )
        ).toMatchSnapshot()
      })
      it('example 337', () => {
        expect(
          scanMarkdown(
            "_foo bar_",
          )
        ).toMatchSnapshot()
      })
      it('example 338', () => {
        expect(
          scanMarkdown(
            "_ foo bar_",
          )
        ).toMatchSnapshot()
      })
      it('example 339', () => {
        expect(
          scanMarkdown(
            "a_\"foo\"_",
          )
        ).toMatchSnapshot()
      })
      it('example 340', () => {
        expect(
          scanMarkdown(
            "foo_bar_",
          )
        ).toMatchSnapshot()
      })
      it('example 341', () => {
        expect(
          scanMarkdown(
            "5_6_78",
          )
        ).toMatchSnapshot()
      })
      it('example 342', () => {
        expect(
          scanMarkdown(
            "пристаням_стремятся_",
          )
        ).toMatchSnapshot()
      })
      it('example 343', () => {
        expect(
          scanMarkdown(
            "aa_\"bb\"_cc",
          )
        ).toMatchSnapshot()
      })
      it('example 344', () => {
        expect(
          scanMarkdown(
            "foo-_(bar)_",
          )
        ).toMatchSnapshot()
      })
      it('example 345', () => {
        expect(
          scanMarkdown(
            "_foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 346', () => {
        expect(
          scanMarkdown(
            "*foo bar *",
          )
        ).toMatchSnapshot()
      })
      it('example 347', () => {
        expect(
          scanMarkdown(
            "*foo bar",
            "*",
          )
        ).toMatchSnapshot()
      })
      it('example 348', () => {
        expect(
          scanMarkdown(
            "*(*foo)",
          )
        ).toMatchSnapshot()
      })
      it('example 349', () => {
        expect(
          scanMarkdown(
            "*(*foo*)*",
          )
        ).toMatchSnapshot()
      })
      it('example 350', () => {
        expect(
          scanMarkdown(
            "*foo*bar",
          )
        ).toMatchSnapshot()
      })
      it('example 351', () => {
        expect(
          scanMarkdown(
            "_foo bar _",
          )
        ).toMatchSnapshot()
      })
      it('example 352', () => {
        expect(
          scanMarkdown(
            "_(_foo)",
          )
        ).toMatchSnapshot()
      })
      it('example 353', () => {
        expect(
          scanMarkdown(
            "_(_foo_)_",
          )
        ).toMatchSnapshot()
      })
      it('example 354', () => {
        expect(
          scanMarkdown(
            "_foo_bar",
          )
        ).toMatchSnapshot()
      })
      it('example 355', () => {
        expect(
          scanMarkdown(
            "_пристаням_стремятся",
          )
        ).toMatchSnapshot()
      })
      it('example 356', () => {
        expect(
          scanMarkdown(
            "_foo_bar_baz_",
          )
        ).toMatchSnapshot()
      })
      it('example 357', () => {
        expect(
          scanMarkdown(
            "_(bar)_.",
          )
        ).toMatchSnapshot()
      })
      it('example 358', () => {
        expect(
          scanMarkdown(
            "**foo bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 359', () => {
        expect(
          scanMarkdown(
            "** foo bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 360', () => {
        expect(
          scanMarkdown(
            "a**\"foo\"**",
          )
        ).toMatchSnapshot()
      })
      it('example 361', () => {
        expect(
          scanMarkdown(
            "foo**bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 362', () => {
        expect(
          scanMarkdown(
            "__foo bar__",
          )
        ).toMatchSnapshot()
      })
      it('example 363', () => {
        expect(
          scanMarkdown(
            "__ foo bar__",
          )
        ).toMatchSnapshot()
      })
      it('example 364', () => {
        expect(
          scanMarkdown(
            "__",
            "foo bar__",
          )
        ).toMatchSnapshot()
      })
      it('example 365', () => {
        expect(
          scanMarkdown(
            "a__\"foo\"__",
          )
        ).toMatchSnapshot()
      })
      it('example 366', () => {
        expect(
          scanMarkdown(
            "foo__bar__",
          )
        ).toMatchSnapshot()
      })
      it('example 367', () => {
        expect(
          scanMarkdown(
            "5__6__78",
          )
        ).toMatchSnapshot()
      })
      it('example 368', () => {
        expect(
          scanMarkdown(
            "пристаням__стремятся__",
          )
        ).toMatchSnapshot()
      })
      it('example 369', () => {
        expect(
          scanMarkdown(
            "__foo, __bar__, baz__",
          )
        ).toMatchSnapshot()
      })
      it('example 370', () => {
        expect(
          scanMarkdown(
            "foo-__(bar)__",
          )
        ).toMatchSnapshot()
      })
      it('example 371', () => {
        expect(
          scanMarkdown(
            "**foo bar **",
          )
        ).toMatchSnapshot()
      })
      it('example 372', () => {
        expect(
          scanMarkdown(
            "**(**foo)",
          )
        ).toMatchSnapshot()
      })
      it('example 373', () => {
        expect(
          scanMarkdown(
            "*(**foo**)*",
          )
        ).toMatchSnapshot()
      })
      it('example 374', () => {
        expect(
          scanMarkdown(
            "**Gomphocarpus (*Gomphocarpus physocarpus*, syn.",
            "*Asclepias physocarpa*)**",
          )
        ).toMatchSnapshot()
      })
      it('example 375', () => {
        expect(
          scanMarkdown(
            "**foo \"*bar*\" foo**",
          )
        ).toMatchSnapshot()
      })
      it('example 376', () => {
        expect(
          scanMarkdown(
            "**foo**bar",
          )
        ).toMatchSnapshot()
      })
      it('example 377', () => {
        expect(
          scanMarkdown(
            "__foo bar __",
          )
        ).toMatchSnapshot()
      })
      it('example 378', () => {
        expect(
          scanMarkdown(
            "__(__foo)",
          )
        ).toMatchSnapshot()
      })
      it('example 379', () => {
        expect(
          scanMarkdown(
            "_(__foo__)_",
          )
        ).toMatchSnapshot()
      })
      it('example 380', () => {
        expect(
          scanMarkdown(
            "__foo__bar",
          )
        ).toMatchSnapshot()
      })
      it('example 381', () => {
        expect(
          scanMarkdown(
            "__пристаням__стремятся",
          )
        ).toMatchSnapshot()
      })
      it('example 382', () => {
        expect(
          scanMarkdown(
            "__foo__bar__baz__",
          )
        ).toMatchSnapshot()
      })
      it('example 383', () => {
        expect(
          scanMarkdown(
            "__(bar)__.",
          )
        ).toMatchSnapshot()
      })
      it('example 384', () => {
        expect(
          scanMarkdown(
            "*foo [bar](/url)*",
          )
        ).toMatchSnapshot()
      })
      it('example 385', () => {
        expect(
          scanMarkdown(
            "*foo",
            "bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 386', () => {
        expect(
          scanMarkdown(
            "_foo __bar__ baz_",
          )
        ).toMatchSnapshot()
      })
      it('example 387', () => {
        expect(
          scanMarkdown(
            "_foo _bar_ baz_",
          )
        ).toMatchSnapshot()
      })
      it('example 388', () => {
        expect(
          scanMarkdown(
            "__foo_ bar_",
          )
        ).toMatchSnapshot()
      })
      it('example 389', () => {
        expect(
          scanMarkdown(
            "*foo *bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 390', () => {
        expect(
          scanMarkdown(
            "*foo **bar** baz*",
          )
        ).toMatchSnapshot()
      })
      it('example 391', () => {
        expect(
          scanMarkdown(
            "*foo**bar**baz*",
          )
        ).toMatchSnapshot()
      })
      it('example 392', () => {
        expect(
          scanMarkdown(
            "***foo** bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 393', () => {
        expect(
          scanMarkdown(
            "*foo **bar***",
          )
        ).toMatchSnapshot()
      })
      it('example 394', () => {
        expect(
          scanMarkdown(
            "*foo**bar***",
          )
        ).toMatchSnapshot()
      })
      it('example 395', () => {
        expect(
          scanMarkdown(
            "*foo **bar *baz* bim** bop*",
          )
        ).toMatchSnapshot()
      })
      it('example 396', () => {
        expect(
          scanMarkdown(
            "*foo [*bar*](/url)*",
          )
        ).toMatchSnapshot()
      })
      it('example 397', () => {
        expect(
          scanMarkdown(
            "** is not an empty emphasis",
          )
        ).toMatchSnapshot()
      })
      it('example 398', () => {
        expect(
          scanMarkdown(
            "**** is not an empty strong emphasis",
          )
        ).toMatchSnapshot()
      })
      it('example 399', () => {
        expect(
          scanMarkdown(
            "**foo [bar](/url)**",
          )
        ).toMatchSnapshot()
      })
      it('example 400', () => {
        expect(
          scanMarkdown(
            "**foo",
            "bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 401', () => {
        expect(
          scanMarkdown(
            "__foo _bar_ baz__",
          )
        ).toMatchSnapshot()
      })
      it('example 402', () => {
        expect(
          scanMarkdown(
            "__foo __bar__ baz__",
          )
        ).toMatchSnapshot()
      })
      it('example 403', () => {
        expect(
          scanMarkdown(
            "____foo__ bar__",
          )
        ).toMatchSnapshot()
      })
      it('example 404', () => {
        expect(
          scanMarkdown(
            "**foo **bar****",
          )
        ).toMatchSnapshot()
      })
      it('example 405', () => {
        expect(
          scanMarkdown(
            "**foo *bar* baz**",
          )
        ).toMatchSnapshot()
      })
      it('example 406', () => {
        expect(
          scanMarkdown(
            "**foo*bar*baz**",
          )
        ).toMatchSnapshot()
      })
      it('example 407', () => {
        expect(
          scanMarkdown(
            "***foo* bar**",
          )
        ).toMatchSnapshot()
      })
      it('example 408', () => {
        expect(
          scanMarkdown(
            "**foo *bar***",
          )
        ).toMatchSnapshot()
      })
      it('example 409', () => {
        expect(
          scanMarkdown(
            "**foo *bar **baz**",
            "bim* bop**",
          )
        ).toMatchSnapshot()
      })
      it('example 410', () => {
        expect(
          scanMarkdown(
            "**foo [*bar*](/url)**",
          )
        ).toMatchSnapshot()
      })
      it('example 411', () => {
        expect(
          scanMarkdown(
            "__ is not an empty emphasis",
          )
        ).toMatchSnapshot()
      })
      it('example 412', () => {
        expect(
          scanMarkdown(
            "____ is not an empty strong emphasis",
          )
        ).toMatchSnapshot()
      })
      it('example 413', () => {
        expect(
          scanMarkdown(
            "foo ***",
          )
        ).toMatchSnapshot()
      })
      it('example 414', () => {
        expect(
          scanMarkdown(
            "foo *\\**",
          )
        ).toMatchSnapshot()
      })
      it('example 415', () => {
        expect(
          scanMarkdown(
            "foo *_*",
          )
        ).toMatchSnapshot()
      })
      it('example 416', () => {
        expect(
          scanMarkdown(
            "foo *****",
          )
        ).toMatchSnapshot()
      })
      it('example 417', () => {
        expect(
          scanMarkdown(
            "foo **\\***",
          )
        ).toMatchSnapshot()
      })
      it('example 418', () => {
        expect(
          scanMarkdown(
            "foo **_**",
          )
        ).toMatchSnapshot()
      })
      it('example 419', () => {
        expect(
          scanMarkdown(
            "**foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 420', () => {
        expect(
          scanMarkdown(
            "*foo**",
          )
        ).toMatchSnapshot()
      })
      it('example 421', () => {
        expect(
          scanMarkdown(
            "***foo**",
          )
        ).toMatchSnapshot()
      })
      it('example 422', () => {
        expect(
          scanMarkdown(
            "****foo*",
          )
        ).toMatchSnapshot()
      })
      it('example 423', () => {
        expect(
          scanMarkdown(
            "**foo***",
          )
        ).toMatchSnapshot()
      })
      it('example 424', () => {
        expect(
          scanMarkdown(
            "*foo****",
          )
        ).toMatchSnapshot()
      })
      it('example 425', () => {
        expect(
          scanMarkdown(
            "foo ___",
          )
        ).toMatchSnapshot()
      })
      it('example 426', () => {
        expect(
          scanMarkdown(
            "foo _\\__",
          )
        ).toMatchSnapshot()
      })
      it('example 427', () => {
        expect(
          scanMarkdown(
            "foo _*_",
          )
        ).toMatchSnapshot()
      })
      it('example 428', () => {
        expect(
          scanMarkdown(
            "foo _____",
          )
        ).toMatchSnapshot()
      })
      it('example 429', () => {
        expect(
          scanMarkdown(
            "foo __\\___",
          )
        ).toMatchSnapshot()
      })
      it('example 430', () => {
        expect(
          scanMarkdown(
            "foo __*__",
          )
        ).toMatchSnapshot()
      })
      it('example 431', () => {
        expect(
          scanMarkdown(
            "__foo_",
          )
        ).toMatchSnapshot()
      })
      it('example 432', () => {
        expect(
          scanMarkdown(
            "_foo__",
          )
        ).toMatchSnapshot()
      })
      it('example 433', () => {
        expect(
          scanMarkdown(
            "___foo__",
          )
        ).toMatchSnapshot()
      })
      it('example 434', () => {
        expect(
          scanMarkdown(
            "____foo_",
          )
        ).toMatchSnapshot()
      })
      it('example 435', () => {
        expect(
          scanMarkdown(
            "__foo___",
          )
        ).toMatchSnapshot()
      })
      it('example 436', () => {
        expect(
          scanMarkdown(
            "_foo____",
          )
        ).toMatchSnapshot()
      })
      it('example 437', () => {
        expect(
          scanMarkdown(
            "**foo**",
          )
        ).toMatchSnapshot()
      })
      it('example 438', () => {
        expect(
          scanMarkdown(
            "*_foo_*",
          )
        ).toMatchSnapshot()
      })
      it('example 439', () => {
        expect(
          scanMarkdown(
            "__foo__",
          )
        ).toMatchSnapshot()
      })
      it('example 440', () => {
        expect(
          scanMarkdown(
            "_*foo*_",
          )
        ).toMatchSnapshot()
      })
      it('example 441', () => {
        expect(
          scanMarkdown(
            "****foo****",
          )
        ).toMatchSnapshot()
      })
      it('example 442', () => {
        expect(
          scanMarkdown(
            "____foo____",
          )
        ).toMatchSnapshot()
      })
      it('example 443', () => {
        expect(
          scanMarkdown(
            "******foo******",
          )
        ).toMatchSnapshot()
      })
      it('example 444', () => {
        expect(
          scanMarkdown(
            "***foo***",
          )
        ).toMatchSnapshot()
      })
      it('example 445', () => {
        expect(
          scanMarkdown(
            "_____foo_____",
          )
        ).toMatchSnapshot()
      })
      it('example 446', () => {
        expect(
          scanMarkdown(
            "*foo _bar* baz_",
          )
        ).toMatchSnapshot()
      })
      it('example 447', () => {
        expect(
          scanMarkdown(
            "*foo __bar *baz bim__ bam*",
          )
        ).toMatchSnapshot()
      })
      it('example 448', () => {
        expect(
          scanMarkdown(
            "**foo **bar baz**",
          )
        ).toMatchSnapshot()
      })
      it('example 449', () => {
        expect(
          scanMarkdown(
            "*foo *bar baz*",
          )
        ).toMatchSnapshot()
      })
      it('example 450', () => {
        expect(
          scanMarkdown(
            "*[bar*](/url)",
          )
        ).toMatchSnapshot()
      })
      it('example 451', () => {
        expect(
          scanMarkdown(
            "_foo [bar_](/url)",
          )
        ).toMatchSnapshot()
      })
      it('example 452', () => {
        expect(
          scanMarkdown(
            "*<img src=\"foo\" title=\"*\"/>",
          )
        ).toMatchSnapshot()
      })
      it('example 453', () => {
        expect(
          scanMarkdown(
            "**<a href=\"**\">",
          )
        ).toMatchSnapshot()
      })
      it('example 454', () => {
        expect(
          scanMarkdown(
            "__<a href=\"__\">",
          )
        ).toMatchSnapshot()
      })
      it('example 455', () => {
        expect(
          scanMarkdown(
            "*a `*`*",
          )
        ).toMatchSnapshot()
      })
      it('example 456', () => {
        expect(
          scanMarkdown(
            "_a `_`_",
          )
        ).toMatchSnapshot()
      })
      it('example 457', () => {
        expect(
          scanMarkdown(
            "**a<http://foo.bar/?q=**>",
          )
        ).toMatchSnapshot()
      })
      it('example 458', () => {
        expect(
          scanMarkdown(
            "__a<http://foo.bar/?q=__>",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.5 Links', () => {
      it('example 459', () => {
        expect(
          scanMarkdown(
            "[link](/uri \"title\")",
          )
        ).toMatchSnapshot()
      })
      it('example 460', () => {
        expect(
          scanMarkdown(
            "[link](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 461', () => {
        expect(
          scanMarkdown(
            "[link]()",
          )
        ).toMatchSnapshot()
      })
      it('example 462', () => {
        expect(
          scanMarkdown(
            "[link](<>)",
          )
        ).toMatchSnapshot()
      })
      it('example 463', () => {
        expect(
          scanMarkdown(
            "[link](/my uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 464', () => {
        expect(
          scanMarkdown(
            "[link](</my uri>)",
          )
        ).toMatchSnapshot()
      })
      it('example 465', () => {
        expect(
          scanMarkdown(
            "[link](foo",
            "bar)",
          )
        ).toMatchSnapshot()
      })
      it('example 466', () => {
        expect(
          scanMarkdown(
            "[link](<foo",
            "bar>)",
          )
        ).toMatchSnapshot()
      })
      it('example 467', () => {
        expect(
          scanMarkdown(
            "[link](\\(foo\\))",
          )
        ).toMatchSnapshot()
      })
      it('example 468', () => {
        expect(
          scanMarkdown(
            "[link](foo(and(bar)))",
          )
        ).toMatchSnapshot()
      })
      it('example 469', () => {
        expect(
          scanMarkdown(
            "[link](foo\\(and\\(bar\\))",
          )
        ).toMatchSnapshot()
      })
      it('example 470', () => {
        expect(
          scanMarkdown(
            "[link](<foo(and(bar)>)",
          )
        ).toMatchSnapshot()
      })
      it('example 471', () => {
        expect(
          scanMarkdown(
            "[link](foo\\)\\:)",
          )
        ).toMatchSnapshot()
      })
      it('example 472', () => {
        expect(
          scanMarkdown(
            "[link](#fragment)",
            "",
            "[link](http://example.com#fragment)",
            "",
            "[link](http://example.com?foo=3#frag)",
          )
        ).toMatchSnapshot()
      })
      it('example 473', () => {
        expect(
          scanMarkdown(
            "[link](foo\\bar)",
          )
        ).toMatchSnapshot()
      })
      it('example 474', () => {
        expect(
          scanMarkdown(
            "[link](foo%20b&auml;)",
          )
        ).toMatchSnapshot()
      })
      it('example 475', () => {
        expect(
          scanMarkdown(
            "[link](\"title\")",
          )
        ).toMatchSnapshot()
      })
      it('example 476', () => {
        expect(
          scanMarkdown(
            "[link](/url \"title\")",
            "[link](/url 'title')",
            "[link](/url (title))",
          )
        ).toMatchSnapshot()
      })
      it('example 477', () => {
        expect(
          scanMarkdown(
            "[link](/url \"title \\\"&quot;\")",
          )
        ).toMatchSnapshot()
      })
      it('example 478', () => {
        expect(
          scanMarkdown(
            "[link](/url \"title\")",
          )
        ).toMatchSnapshot()
      })
      it('example 479', () => {
        expect(
          scanMarkdown(
            "[link](/url \"title \"and\" title\")",
          )
        ).toMatchSnapshot()
      })
      it('example 480', () => {
        expect(
          scanMarkdown(
            "[link](/url 'title \"and\" title')",
          )
        ).toMatchSnapshot()
      })
      it('example 481', () => {
        expect(
          scanMarkdown(
            "[link](   /uri",
            "  \"title\"  )",
          )
        ).toMatchSnapshot()
      })
      it('example 482', () => {
        expect(
          scanMarkdown(
            "[link] (/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 483', () => {
        expect(
          scanMarkdown(
            "[link [foo [bar]]](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 484', () => {
        expect(
          scanMarkdown(
            "[link] bar](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 485', () => {
        expect(
          scanMarkdown(
            "[link [bar](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 486', () => {
        expect(
          scanMarkdown(
            "[link \\[bar](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 487', () => {
        expect(
          scanMarkdown(
            "[link *foo **bar** `#`*](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 488', () => {
        expect(
          scanMarkdown(
            "[![moon](moon.jpg)](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 489', () => {
        expect(
          scanMarkdown(
            "[foo [bar](/uri)](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 490', () => {
        expect(
          scanMarkdown(
            "[foo *[bar [baz](/uri)](/uri)*](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 491', () => {
        expect(
          scanMarkdown(
            "![[[foo](uri1)](uri2)](uri3)",
          )
        ).toMatchSnapshot()
      })
      it('example 492', () => {
        expect(
          scanMarkdown(
            "*[foo*](/uri)",
          )
        ).toMatchSnapshot()
      })
      it('example 493', () => {
        expect(
          scanMarkdown(
            "[foo *bar](baz*)",
          )
        ).toMatchSnapshot()
      })
      it('example 494', () => {
        expect(
          scanMarkdown(
            "*foo [bar* baz]",
          )
        ).toMatchSnapshot()
      })
      it('example 495', () => {
        expect(
          scanMarkdown(
            "[foo <bar attr=\"](baz)\">",
          )
        ).toMatchSnapshot()
      })
      it('example 496', () => {
        expect(
          scanMarkdown(
            "[foo`](/uri)`",
          )
        ).toMatchSnapshot()
      })
      it('example 497', () => {
        expect(
          scanMarkdown(
            "[foo<http://example.com/?search=](uri)>",
          )
        ).toMatchSnapshot()
      })
      it('example 498', () => {
        expect(
          scanMarkdown(
            "[foo][bar]",
            "",
            "[bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 499', () => {
        expect(
          scanMarkdown(
            "[link [foo [bar]]][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 500', () => {
        expect(
          scanMarkdown(
            "[link \\[bar][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 501', () => {
        expect(
          scanMarkdown(
            "[link *foo **bar** `#`*][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 502', () => {
        expect(
          scanMarkdown(
            "[![moon](moon.jpg)][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 503', () => {
        expect(
          scanMarkdown(
            "[foo [bar](/uri)][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 504', () => {
        expect(
          scanMarkdown(
            "[foo *bar [baz][ref]*][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 505', () => {
        expect(
          scanMarkdown(
            "*[foo*][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 506', () => {
        expect(
          scanMarkdown(
            "[foo *bar][ref]",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 507', () => {
        expect(
          scanMarkdown(
            "[foo <bar attr=\"][ref]\">",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 508', () => {
        expect(
          scanMarkdown(
            "[foo`][ref]`",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 509', () => {
        expect(
          scanMarkdown(
            "[foo<http://example.com/?search=][ref]>",
            "",
            "[ref]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 510', () => {
        expect(
          scanMarkdown(
            "[foo][BaR]",
            "",
            "[bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 511', () => {
        expect(
          scanMarkdown(
            "[Толпой][Толпой] is a Russian word.",
            "",
            "[ТОЛПОЙ]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 512', () => {
        expect(
          scanMarkdown(
            "[Foo",
            "  bar]: /url",
            "",
            "[Baz][Foo bar]",
          )
        ).toMatchSnapshot()
      })
      it('example 513', () => {
        expect(
          scanMarkdown(
            "[foo] [bar]",
            "",
            "[bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 514', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "[bar]",
            "",
            "[bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 515', () => {
        expect(
          scanMarkdown(
            "[foo]: /url1",
            "",
            "[foo]: /url2",
            "",
            "[bar][foo]",
          )
        ).toMatchSnapshot()
      })
      it('example 516', () => {
        expect(
          scanMarkdown(
            "[bar][foo\\!]",
            "",
            "[foo!]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 517', () => {
        expect(
          scanMarkdown(
            "[foo][ref[]",
            "",
            "[ref[]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 518', () => {
        expect(
          scanMarkdown(
            "[foo][ref[bar]]",
            "",
            "[ref[bar]]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 519', () => {
        expect(
          scanMarkdown(
            "[[[foo]]]",
            "",
            "[[[foo]]]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 520', () => {
        expect(
          scanMarkdown(
            "[foo][ref\\[]",
            "",
            "[ref\\[]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 521', () => {
        expect(
          scanMarkdown(
            "[bar\\\\]: /uri",
            "",
            "[bar\\\\]",
          )
        ).toMatchSnapshot()
      })
      it('example 522', () => {
        expect(
          scanMarkdown(
            "[]",
            "",
            "[]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 523', () => {
        expect(
          scanMarkdown(
            "[",
            " ]",
            "",
            "[",
            " ]: /uri",
          )
        ).toMatchSnapshot()
      })
      it('example 524', () => {
        expect(
          scanMarkdown(
            "[foo][]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 525', () => {
        expect(
          scanMarkdown(
            "[*foo* bar][]",
            "",
            "[*foo* bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 526', () => {
        expect(
          scanMarkdown(
            "[Foo][]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 527', () => {
        expect(
          scanMarkdown(
            "[foo] ",
            "[]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 528', () => {
        expect(
          scanMarkdown(
            "[foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 529', () => {
        expect(
          scanMarkdown(
            "[*foo* bar]",
            "",
            "[*foo* bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 530', () => {
        expect(
          scanMarkdown(
            "[[*foo* bar]]",
            "",
            "[*foo* bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 531', () => {
        expect(
          scanMarkdown(
            "[[bar [foo]",
            "",
            "[foo]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 532', () => {
        expect(
          scanMarkdown(
            "[Foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 533', () => {
        expect(
          scanMarkdown(
            "[foo] bar",
            "",
            "[foo]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 534', () => {
        expect(
          scanMarkdown(
            "\\[foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 535', () => {
        expect(
          scanMarkdown(
            "[foo*]: /url",
            "",
            "*[foo*]",
          )
        ).toMatchSnapshot()
      })
      it('example 536', () => {
        expect(
          scanMarkdown(
            "[foo][bar]",
            "",
            "[foo]: /url1",
            "[bar]: /url2",
          )
        ).toMatchSnapshot()
      })
      it('example 537', () => {
        expect(
          scanMarkdown(
            "[foo][]",
            "",
            "[foo]: /url1",
          )
        ).toMatchSnapshot()
      })
      it('example 538', () => {
        expect(
          scanMarkdown(
            "[foo]()",
            "",
            "[foo]: /url1",
          )
        ).toMatchSnapshot()
      })
      it('example 539', () => {
        expect(
          scanMarkdown(
            "[foo](not a link)",
            "",
            "[foo]: /url1",
          )
        ).toMatchSnapshot()
      })
      it('example 540', () => {
        expect(
          scanMarkdown(
            "[foo][bar][baz]",
            "",
            "[baz]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 541', () => {
        expect(
          scanMarkdown(
            "[foo][bar][baz]",
            "",
            "[baz]: /url1",
            "[bar]: /url2",
          )
        ).toMatchSnapshot()
      })
      it('example 542', () => {
        expect(
          scanMarkdown(
            "[foo][bar][baz]",
            "",
            "[baz]: /url1",
            "[foo]: /url2",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.6 Images', () => {
      it('example 543', () => {
        expect(
          scanMarkdown(
            "![foo](/url \"title\")",
          )
        ).toMatchSnapshot()
      })
      it('example 544', () => {
        expect(
          scanMarkdown(
            "![foo *bar*]",
            "",
            "[foo *bar*]: train.jpg \"train & tracks\"",
          )
        ).toMatchSnapshot()
      })
      it('example 545', () => {
        expect(
          scanMarkdown(
            "![foo ![bar](/url)](/url2)",
          )
        ).toMatchSnapshot()
      })
      it('example 546', () => {
        expect(
          scanMarkdown(
            "![foo [bar](/url)](/url2)",
          )
        ).toMatchSnapshot()
      })
      it('example 547', () => {
        expect(
          scanMarkdown(
            "![foo *bar*][]",
            "",
            "[foo *bar*]: train.jpg \"train & tracks\"",
          )
        ).toMatchSnapshot()
      })
      it('example 548', () => {
        expect(
          scanMarkdown(
            "![foo *bar*][foobar]",
            "",
            "[FOOBAR]: train.jpg \"train & tracks\"",
          )
        ).toMatchSnapshot()
      })
      it('example 549', () => {
        expect(
          scanMarkdown(
            "![foo](train.jpg)",
          )
        ).toMatchSnapshot()
      })
      it('example 550', () => {
        expect(
          scanMarkdown(
            "My ![foo bar](/path/to/train.jpg  \"title\"   )",
          )
        ).toMatchSnapshot()
      })
      it('example 551', () => {
        expect(
          scanMarkdown(
            "![foo](<url>)",
          )
        ).toMatchSnapshot()
      })
      it('example 552', () => {
        expect(
          scanMarkdown(
            "![](/url)",
          )
        ).toMatchSnapshot()
      })
      it('example 553', () => {
        expect(
          scanMarkdown(
            "![foo][bar]",
            "",
            "[bar]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 554', () => {
        expect(
          scanMarkdown(
            "![foo][bar]",
            "",
            "[BAR]: /url",
          )
        ).toMatchSnapshot()
      })
      it('example 555', () => {
        expect(
          scanMarkdown(
            "![foo][]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 556', () => {
        expect(
          scanMarkdown(
            "![*foo* bar][]",
            "",
            "[*foo* bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 557', () => {
        expect(
          scanMarkdown(
            "![Foo][]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 558', () => {
        expect(
          scanMarkdown(
            "![foo] ",
            "[]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 559', () => {
        expect(
          scanMarkdown(
            "![foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 560', () => {
        expect(
          scanMarkdown(
            "![*foo* bar]",
            "",
            "[*foo* bar]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 561', () => {
        expect(
          scanMarkdown(
            "![[foo]]",
            "",
            "[[foo]]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 562', () => {
        expect(
          scanMarkdown(
            "![Foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 563', () => {
        expect(
          scanMarkdown(
            "!\\[foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
      it('example 564', () => {
        expect(
          scanMarkdown(
            "\\![foo]",
            "",
            "[foo]: /url \"title\"",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.7 Autolinks', () => {
      // NOTE: 'γ' breaks URI format, creating false negatives
      it('example 565', () => {
        expect(
          scanMarkdown(
            "<http://foo.bar.baz>",
          )
        ).toMatchSnapshot()
      })
      it('example 566', () => {
        expect(
          scanMarkdown(
            "<http://foo.bar.baz/test?q=hello&id=22&boolean>",
          )
        ).toMatchSnapshot()
      })
      it('example 567', () => {
        expect(
          scanMarkdown(
            "<irc://foo.bar:2233/baz>",
          )
        ).toMatchSnapshot()
      })
      it('example 568', () => {
        expect(
          scanMarkdown(
            "<MAILTO:FOO@BAR.BAZ>",
          )
        ).toMatchSnapshot()
      })
      it('example 569', () => {
        expect(
          scanMarkdown(
            "<a+b+c:d>",
          )
        ).toMatchSnapshot()
      })
      it('example 570', () => {
        expect(
          scanMarkdown(
            "<made-up-scheme://foo,bar>",
          )
        ).toMatchSnapshot()
      })
      it('example 571', () => {
        expect(
          scanMarkdown(
            "<http://../>",
          )
        ).toMatchSnapshot()
      })
      it('example 572', () => {
        expect(
          scanMarkdown(
            "<localhost:5001/foo>",
          )
        ).toMatchSnapshot()
      })
      it('example 573', () => {
        expect(
          scanMarkdown(
            "<http://foo.bar/baz bim>",
          )
        ).toMatchSnapshot()
      })
      it('example 574', () => {
        expect(
          scanMarkdown(
            "<http://example.com/\\[\\>",
          )
        ).toMatchSnapshot()
      })
      it('example 575', () => {
        expect(
          scanMarkdown(
            "<foo@bar.example.com>",
          )
        ).toMatchSnapshot()
      })
      it('example 576', () => {
        expect(
          scanMarkdown(
            "<foo+special@Bar.baz-bar0.com>",
          )
        ).toMatchSnapshot()
      })
      it('example 577', () => {
        expect(
          scanMarkdown(
            "<foo\\+@bar.example.com>",
          )
        ).toMatchSnapshot()
      })
      it('example 578', () => {
        expect(
          scanMarkdown(
            "<>",
          )
        ).toMatchSnapshot()
      })
      it('example 579', () => {
        expect(
          scanMarkdown(
            "< http://foo.bar >",
          )
        ).toMatchSnapshot()
      })
      it('example 580', () => {
        expect(
          scanMarkdown(
            "<m:abc>",
          )
        ).toMatchSnapshot()
      })
      it('example 581', () => {
        expect(
          scanMarkdown(
            "<foo.bar.baz>",
          )
        ).toMatchSnapshot()
      })
      it('example 582', () => {
        expect(
          scanMarkdown(
            "http://example.com",
          )
        ).toMatchSnapshot()
      })
      it('example 583', () => {
        expect(
          scanMarkdown(
            "foo@bar.example.com",
          )
        ).toMatchSnapshot()
      })
    })
    describe.skip('6.8 Raw HTML', () => {
      it('example 584', () => {
        expect(
          scanMarkdown(
            "<a><bab><c2c>",
          )
        ).toMatchSnapshot()
      })
      it('example 585', () => {
        expect(
          scanMarkdown(
            "<a/><b2/>",
          )
        ).toMatchSnapshot()
      })
      it('example 586', () => {
        expect(
          scanMarkdown(
            "<a  /><b2",
            "data=\"foo\" >",
          )
        ).toMatchSnapshot()
      })
      it('example 587', () => {
        expect(
          scanMarkdown(
            "<a foo=\"bar\" bam = 'baz <em>\"</em>'",
            "_boolean zoop:33=zoop:33 />",
          )
        ).toMatchSnapshot()
      })
      it('example 588', () => {
        expect(
          scanMarkdown(
            "Foo <responsive-image src=\"foo.jpg\" />",
          )
        ).toMatchSnapshot()
      })
      it('example 589', () => {
        expect(
          scanMarkdown(
            "<33> <__>",
          )
        ).toMatchSnapshot()
      })
      it('example 590', () => {
        expect(
          scanMarkdown(
            "<a h*#ref=\"hi\">",
          )
        ).toMatchSnapshot()
      })
      it('example 591', () => {
        expect(
          scanMarkdown(
            "<a href=\"hi'> <a href=hi'>",
          )
        ).toMatchSnapshot()
      })
      it('example 592', () => {
        expect(
          scanMarkdown(
            "< a><",
            "foo><bar/ >",
          )
        ).toMatchSnapshot()
      })
      it('example 593', () => {
        expect(
          scanMarkdown(
            "<a href='bar'title=title>",
          )
        ).toMatchSnapshot()
      })
      it('example 594', () => {
        expect(
          scanMarkdown(
            "</a></foo >",
          )
        ).toMatchSnapshot()
      })
      it('example 595', () => {
        expect(
          scanMarkdown(
            "</a href=\"foo\">",
          )
        ).toMatchSnapshot()
      })
      it('example 596', () => {
        expect(
          scanMarkdown(
            "foo <!-- this is a",
            "comment - with hyphen -->",
          )
        ).toMatchSnapshot()
      })
      it('example 597', () => {
        expect(
          scanMarkdown(
            "foo <!-- not a comment -- two hyphens -->",
          )
        ).toMatchSnapshot()
      })
      it('example 598', () => {
        expect(
          scanMarkdown(
            "foo <!--> foo -->",
            "",
            "foo <!-- foo--->",
          )
        ).toMatchSnapshot()
      })
      it('example 599', () => {
        expect(
          scanMarkdown(
            "foo <?php echo $a; ?>",
          )
        ).toMatchSnapshot()
      })
      it('example 600', () => {
        expect(
          scanMarkdown(
            "foo <!ELEMENT br EMPTY>",
          )
        ).toMatchSnapshot()
      })
      it('example 601', () => {
        expect(
          scanMarkdown(
            "foo <![CDATA[>&<]]>",
          )
        ).toMatchSnapshot()
      })
      it('example 602', () => {
        expect(
          scanMarkdown(
            "foo <a href=\"&ouml;\">",
          )
        ).toMatchSnapshot()
      })
      it('example 603', () => {
        expect(
          scanMarkdown(
            "foo <a href=\"\\*\">",
          )
        ).toMatchSnapshot()
      })
      it('example 604', () => {
        expect(
          scanMarkdown(
            "<a href=\"\\\"\">",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.9 Hard line breaks', () => {
      it('example 605', () => {
        expect(
          scanMarkdown(
            "foo  ",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 606', () => {
        expect(
          scanMarkdown(
            "foo\\",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 607', () => {
        expect(
          scanMarkdown(
            "foo       ",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 608', () => {
        expect(
          scanMarkdown(
            "foo  ",
            "     bar",
          )
        ).toMatchSnapshot()
      })
      it('example 609', () => {
        expect(
          scanMarkdown(
            "foo\\",
            "     bar",
          )
        ).toMatchSnapshot()
      })
      it('example 610', () => {
        expect(
          scanMarkdown(
            "*foo  ",
            "bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 611', () => {
        expect(
          scanMarkdown(
            "*foo\\",
            "bar*",
          )
        ).toMatchSnapshot()
      })
      it('example 612', () => {
        expect(
          scanMarkdown(
            "`code  ",
            "span`",
          )
        ).toMatchSnapshot()
      })
      it('example 613', () => {
        expect(
          scanMarkdown(
            "`code\\",
            "span`",
          )
        ).toMatchSnapshot()
      })
      it('example 614', () => {
        expect(
          scanMarkdown(
            "<a href=\"foo  ",
            "bar\">",
          )
        ).toMatchSnapshot()
      })
      it('example 615', () => {
        expect(
          scanMarkdown(
            "<a href=\"foo\\",
            "bar\">",
          )
        ).toMatchSnapshot()
      })
      it('example 616', () => {
        expect(
          scanMarkdown(
            "foo\\",
          )
        ).toMatchSnapshot()
      })
      it('example 617', () => {
        expect(
          scanMarkdown(
            "foo  ",
          )
        ).toMatchSnapshot()
      })
      it('example 618', () => {
        expect(
          scanMarkdown(
            "### foo\\",
          )
        ).toMatchSnapshot()
      })
      it('example 619', () => {
        expect(
          scanMarkdown(
            "### foo  ",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.10 Soft line breaks', () => {
      it('example 620', () => {
        expect(
          scanMarkdown(
            "foo",
            "baz",
          )
        ).toMatchSnapshot()
      })
      it('example 621', () => {
        expect(
          scanMarkdown(
            "foo ",
            " baz",
          )
        ).toMatchSnapshot()
      })
    })
    describe('6.11 Textual content', () => {
      it('example 622', () => {
        expect(
          scanMarkdown(
            "hello $.;'there",
          )
        ).toMatchSnapshot()
      })
      it('example 623', () => {
        expect(
          scanMarkdown(
            "Foo χρῆν",
          )
        ).toMatchSnapshot()
      })
      it('example 624', () => {
        expect(
          scanMarkdown(
            "Multiple     spaces",
          )
        ).toMatchSnapshot()
      })
    })
  })
})
