// Credits: ChatGPT

import { randomChoice } from "./util";

type RegexAST =
  | GroupNode
  | ChoiceNode
  | RepetitionNode
  | LiteralNode
  | CharSelectNode;

/**
 * (group)
 */
interface GroupNode {
  type: "group";
  children: RegexAST[];
}

/**
 * a|b|c
 */
interface ChoiceNode {
  type: "choice";
  children: RegexAST[];
}

/**
 * [a-z]
 */
interface CharSelectNode {
  type: "range";
  selection: string;
}

/**
 * a+
 */
interface RepetitionNode {
  type: "repetition";
  min: number;
  max: number | null;
  child: RegexAST;
}

/**
 * a
 */
interface LiteralNode {
  type: "literal";
  value: string;
}

// Implement a simple lexer
class Lexer {
  constructor(private input: string) {}

  nextChar() {
    return this.input.charAt(0);
  }

  consumeChar() {
    const currentChar = this.nextChar();
    if (currentChar === ``) throw new Error(`Unexpected end of input`);
    this.input = this.input.slice(1);
    return currentChar;
  }

  consumeWhile(predicate: (char: string) => boolean) {
    let result = ``;
    while (predicate(this.nextChar())) {
      result += this.consumeChar();
    }
    return result;
  }
}

// Implement the parser
class Parser {
  protected isInCharSelect = false;
  constructor(private lexer: Lexer) {}

  parse() {
    const result = this.parseChoice();
    if (this.lexer.nextChar() !== ``) {
      throw new Error(`Expected end of input, got ${this.lexer.nextChar()}`);
    }
    return result;
  }

  parseChoice(): ChoiceNode {
    const children = [this.parseSequence()];
    while (this.lexer.nextChar() === `|`) {
      this.lexer.consumeChar(); // consume '|'
      children.push(this.parseSequence());
    }
    return { type: `choice`, children };
  }

  parseSequence(): GroupNode {
    const children = [this.parseRepeat()];
    while (
      this.lexer.nextChar() !== `` &&
      this.lexer.nextChar() !== `)` &&
      this.lexer.nextChar() !== `|`
    ) {
      children.push(this.parseRepeat());
    }
    return { type: `group`, children };
  }

  /**
   * Falls back to parsePrimary
   */
  parseRepeat(): RegexAST {
    const value = this.parsePrimary();

    if (this.lexer.nextChar() === `{`) {
      // Range quantifier
      this.lexer.consumeChar(); // consume '{'
      const min = Number(this.lexer.consumeWhile((char) => /\d/.test(char)));
      let max: number | null = min;
      if (this.lexer.nextChar() === `,`) {
        this.lexer.consumeChar(); // consume ','
        const maxStr = this.lexer.consumeWhile((char) => char !== `}`);

        // update max if it exists
        if (maxStr !== ``) {
          if (!maxStr.match(/^\d+$/))
            throw new Error(`Maximum repeat of ${maxStr} is not a number`);
          max = Number(maxStr);
          if (max < min)
            throw new Error(
              `Maximum repeat ${max} is less than minimum repeat ${min}`
            );
        }
      }
      if (this.lexer.consumeChar() !== `}`) {
        throw new Error(`Expected "}"`);
      }
      return { type: `repetition`, min, max, child: value };
    } else if (this.lexer.nextChar() === `?`) {
      this.lexer.consumeChar(); // consume '?'
      return { type: `repetition`, min: 0, max: 1, child: value };
    } else if (this.lexer.nextChar() === `+`) {
      this.lexer.consumeChar(); // consume '+'
      return { type: `repetition`, min: 1, max: null, child: value };
    } else if (this.lexer.nextChar() === `*`) {
      this.lexer.consumeChar(); // consume '*'
      return { type: `repetition`, min: 0, max: null, child: value };
    }
    return value;
  }

  parseCharSelect(): CharSelectNode {
    const possibleChars = [];
    while (this.lexer.nextChar() !== `]`) {
      const chr = this.lexer.consumeChar();
      if (this.lexer.nextChar() === `-`) {
        // is range, like [a-z]
        this.lexer.consumeChar(); // consume '-'
        const end = this.lexer.consumeChar();
        const startCode = chr.charCodeAt(0);
        const endCode = end.charCodeAt(0);

        if (startCode > endCode) {
          throw new Error(`Invalid range "${chr}-${end}"`);
        }

        for (let i = startCode; i <= endCode; i++) {
          possibleChars.push(String.fromCharCode(i));
        }

        continue;
      }

      if (this.lexer.nextChar() === `\\`) {
        this.lexer.consumeChar(); // consume '\'
        const escaped = this.lexer.consumeChar();
        if (escaped === `d`) {
          // digit
          for (let i = 0; i <= 9; i++) {
            possibleChars.push(String(i));
          }
        } else if (escaped === `w`) {
          // word
          for (let i = 97; i <= 122; i++) {
            possibleChars.push(String.fromCharCode(i));
          }
          for (let i = 65; i <= 90; i++) {
            possibleChars.push(String.fromCharCode(i));
          }
          // _ is also a word
          possibleChars.push(`_`);
        } else if (escaped === `s`) {
          // whitespace
          possibleChars.push(` `, `\n`, `\t`, `\r`);
        } else {
          // everything else
          possibleChars.push(escaped);
        }
        continue;
      }

      possibleChars.push(chr);
    }
    return { type: `range`, selection: possibleChars.join(``) };
  }

  parsePrimary(): RegexAST {
    if (this.lexer.nextChar() === `(`) {
      this.lexer.consumeChar(); // consume '('
      const group = this.parseChoice();
      if (group.children.length === 0) {
        throw new Error(`Empty group`);
      }
      if (this.lexer.consumeChar() !== `)`) {
        throw new Error(`Expected ")"`);
      }
      return group;
    }

    if (this.lexer.nextChar() === `[` && !this.isInCharSelect) {
      this.lexer.consumeChar(); // consume '['
      this.isInCharSelect = true;
      const range = this.parseCharSelect();
      if (range.selection.length === 0) {
        throw new Error(`Empty range`);
      }
      if (this.lexer.consumeChar() !== `]`) {
        throw new Error(`Expected "]"`);
      }
      this.isInCharSelect = false;
      return range;
    }

    let chr = this.lexer.consumeChar();

    if (chr.match(/[[\](){}|?*+]/)) {
      throw new Error(`Unexpected non-escaped character "${chr}"`);
    }

    if (chr === `\\`) chr = this.lexer.consumeChar();

    return { type: `literal`, value: chr };
  }
}

// Implement the ExpandableRegex class
export class ExpandableRegex {
  protected _ast: RegexAST;

  constructor(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    this._ast = parser.parse();
  }

  random(): string {
    return this.generate(this._ast);
  }

  get ast() {
    return this._ast;
  }

  public stringifyAst() {
    return this._stringifyAst(this._ast);
  }

  protected _stringifyAst(node: RegexAST, indent = ``): string {
    switch (node.type) {
      case `literal`:
        return indent + `Literal: ${node.value}\n`;
      case `group`:
        return (
          indent +
          (node.children.length
            ? `Group:\n` +
              node.children
                .map((child) => this._stringifyAst(child, indent + `  `))
                .join(``)
            : `Empty Group`)
        );
      case `choice`:
        return (
          indent +
          `Choice of ${node.children.length}:\n` +
          node.children
            .map((child) => this._stringifyAst(child, indent + `  `))
            .join(``)
        );
      case `range`:
        return indent + `Range: [${node.selection}]\n`;
      case `repetition`:
        return (
          indent +
          `Repetition: {${node.min}, ${node.max}}\n` +
          this._stringifyAst(node.child, indent + `  `)
        );
    }
  }

  private generate(node: RegexAST): string {
    switch (node.type) {
      case `literal`:
        return node.value;
      case `group`:
        return node.children.map((child) => this.generate(child)).join(``);
      case `choice`: {
        const choice = randomChoice(node.children);
        if (!choice)
          throw new Error(`node has no children (should not happen)`);
        return this.generate(choice);
      }
      case `range`: {
        const choice = randomChoice(node.selection);
        if (!choice)
          throw new Error(`node has no selection (should not happen)`);
        return choice;
      }
      case `repetition`: {
        const count = this.getRandomCount(node.min, node.max);
        return Array(count)
          .fill(null)
          .map(() => this.generate(node.child))
          .join(``);
      }
    }
  }

  /**
   * Inclusive range
   */
  private getRandomCount(min: number, max: number | null): number {
    if (max === null) {
      let count = min;
      // exponentially decreasing probability
      // with min adjustment
      while (Math.random() > 0.5 / min ** (1 / 3)) {
        count++;
      }
      return count;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}

const expandableRegexCache = new Map<string, ExpandableRegex>();

/**
 * Shorthand for
 *
 * ```ts
 * const er = new ExpandableRegex(input);
 *
 * er.random();
 * ```
 *
 * Has internal cache for ast parsing
 */
export function expandableRegex(template: TemplateStringsArray | string) {
  if (typeof template === `string`)
    template = [template] as unknown as TemplateStringsArray;

  if (template.length > 1) throw new Error(`string must be static`);
  const input = template[0]!;
  if (!expandableRegexCache.has(input)) {
    expandableRegexCache.set(input, new ExpandableRegex(input));
  }
  return expandableRegexCache.get(input)!.random();
}

/**
 * name alias
 */
export const er = expandableRegex;
