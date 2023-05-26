// Credits: ChatGPT

type RegexAST =
  | GroupNode
  | ChoiceNode
  | RepetitionNode
  | LiteralNode;
 
interface GroupNode {
  type: 'group';
  children: RegexAST[];
}
 
interface ChoiceNode {
  type: 'choice';
  children: RegexAST[];
}
 
interface RepetitionNode {
  type: 'repetition';
  min: number;
  max: number | null;
  child: RegexAST;
}
 
interface LiteralNode {
  type: 'literal';
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
    this.input = this.input.slice(1);
    return currentChar;
  }
 
  consumeWhile(predicate: (char: string) => boolean) {
    let result = '';
    while (predicate(this.nextChar())) {
      result += this.consumeChar();
    }
    return result;
  }
}
 
// Implement the parser
class Parser {
  constructor(private lexer: Lexer) {}
 
  parse() {
    const result = this.parseChoice();
    if (this.lexer.nextChar() !== '') {
      throw new Error('Unexpected character');
    }
    return result;
  }
 
  parseChoice(): ChoiceNode {
    const children = [this.parseSequence()];
    while (this.lexer.nextChar() === '|') {
      this.lexer.consumeChar(); // consume '|'
      children.push(this.parseSequence());
    }
    return { type: 'choice', children };
  }
 
  parseSequence(): GroupNode {
    const children = [this.parseRepeat()];
    while (
      this.lexer.nextChar() !== '' &&
      this.lexer.nextChar() !== ')' &&
      this.lexer.nextChar() !== '|'
    ) {
      children.push(this.parseRepeat());
    }
    return { type: 'group', children };
  }
 
  parseRepeat(): RegexAST {
    const value = this.parsePrimary();
    // consume escape character
    if (this.lexer.nextChar() === '\\') {
      this.lexer.consumeChar(); // consume '\'
      return { type: 'literal', value: this.lexer.consumeChar() };
    }

    if (this.lexer.nextChar() === '{') {
      // Range quantifier
      this.lexer.consumeChar(); // consume '{'
      const min = Number(this.lexer.consumeWhile((char) => /\d/.test(char)));
      let max: number | null = null;
      if (this.lexer.nextChar() === ',') {
        this.lexer.consumeChar(); // consume ','
        max = Number(this.lexer.consumeWhile((char) => /\d/.test(char)));
      }
      if (this.lexer.consumeChar() !== '}') {
        throw new Error('Expected "}"');
      }
      return { type: 'repetition', min, max, child: value };
    } else if (this.lexer.nextChar() === '?') {
      this.lexer.consumeChar(); // consume '?'
      return { type: 'repetition', min: 0, max: 1, child: value };
    } else if (this.lexer.nextChar() === '+') {
      this.lexer.consumeChar(); // consume '+'
      return { type: 'repetition', min: 1, max: null, child: value };
    } else if (this.lexer.nextChar() === '*') {
      this.lexer.consumeChar(); // consume '*'
      return { type: 'repetition', min: 0, max: null, child: value };
    } else {
      return value;
    }
  }
 
  parsePrimary(): RegexAST {
    if (this.lexer.nextChar() === '(') {
      this.lexer.consumeChar(); // consume '('
      const group = this.parseChoice();
      if (this.lexer.consumeChar() !== ')') {
        throw new Error('Expected ")"');
      }
      return group;
    } else {
      return { type: 'literal', value: this.lexer.consumeChar() };
    }
  }
}
 
// Implement the ExpandableRegex class
class ExpandableRegex {
  private ast: RegexAST;
 
  constructor(input: string) {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    this.ast = parser.parse();
  }
 
  random(): string {
    return this.generate(this.ast);
  }
 
  private generate(node: RegexAST): string {
    switch (node.type) {
      case 'literal':
        return node.value;
      case 'group':
        return node.children.map(child => this.generate(child)).join('');
      case 'choice': {
        const index = Math.floor(Math.random() * node.children.length);
        return this.generate(node.children[index]);
      }
      case 'repetition': {
        const count = this.getRandomCount(node.min, node.max);
        return Array(count)
          .fill(null)
          .map(() => this.generate(node.child))
          .join('');
      }
    }
  }
 
  private getRandomCount(min: number, max: number | null): number {
    if (max === null) {
      let count = min;
      // exponentially decreasing probability
      while (Math.random() > 0.5) {
        count++;
      }
      return count;
    } else {
      return min + Math.floor(Math.random() * (max - min + 1));
    }
  }
}
