import {
  MuttonCompiledTemplate,
  MuttonCompiledNodeType,
  MuttonCompiledLiteralNode,
  MuttonCompiledExpressionNode,
} from './types';

const TEMPLATE_START_CHAR = '{';
const TEMPLATE_END_CHAR = '}';
const SINGLE_QUOTE_CHAR = "'";
const DOUBLE_QUOTE_CHAR = '"';

/**
 * The length of the start/end pattern of a template variable: `{{`
 */
const TEMPLATE_VARIABLE_PATTERN_LENGTH = TEMPLATE_START_CHAR.length * 2;

abstract class MuttonCompilerState {
  protected compiler: MuttonCompiler;

  constructor(compiler: MuttonCompiler) {
    this.compiler = compiler;
  }

  /**
   * Called for every character while looping in the compiler
   *
   * @param char - Character that is currently being traveresed in the compiler
   */
  abstract onChar(char: string): void;
}

/**
 * This state is entered when after seeing `{{`
 */
class MuttonCompilerWithinVariableState extends MuttonCompilerState {
  onChar(char: string) {
    const nextChar = this.compiler.lookAhead(1);

    // Search for the `}}` pattern, so we know when we've reached the end of
    // the template variable.
    if (char === TEMPLATE_END_CHAR && nextChar === TEMPLATE_END_CHAR) {
      this.compiler.skip(1);
      this.compiler.addExpressionNode();
      this.compiler.changeToDefaultState();
    } else if (char === SINGLE_QUOTE_CHAR) {
      this.compiler.changeToWithinSingleQuoteState();
    } else if (char === DOUBLE_QUOTE_CHAR) {
      this.compiler.changeToWithinDoubleQuoteState();
    }
  }
}

/**
 * Initial entry state responsible for simply concatenating the rendered
 * template and determining when we enter a variable.
 */
class MuttonCompilerDefaultState extends MuttonCompilerState {
  onChar(char: string) {
    const nextChar = this.compiler.lookAhead(1);

    // If the current sequence of chars is the variable start pattern (`{{`),
    // we enter the `WithinVariableState`
    if (char === TEMPLATE_START_CHAR && nextChar === TEMPLATE_START_CHAR) {
      // We need to check whether the end of the string doesn't end with `{{`.
      // If it does, we need to treat that as a string literal instead of as
      // the beginning of an expression.
      const twoCharsForward = this.compiler.lookAhead(2);

      if (!twoCharsForward) {
        this.compiler.skip(2);
        this.compiler.addLiteralNode();
      } else {
        const currentPosition = this.compiler.getPosition();
        const prevNodeEnd = this.compiler.getPreviousNodeEnd();

        // If the current compiler position is 0, we do not want to add a
        // literal node because there was no literals before this. If the
        // current position is not 0, and the previous position is not the same
        // as the last state change position, then there are literals in
        // between that we need to add.
        if (currentPosition !== 0 && currentPosition - 1 !== prevNodeEnd) {
          this.compiler.addLiteralNode();
        }

        this.compiler.skip(1);
        this.compiler.changeToWithinVariableState();
      }
    } else if (!nextChar) {
      this.compiler.addLiteralNode();
    }
  }
}

/**
 * This state is entered when after seeing single quote inside of an expression
 *
 * Example: `{{firstName + '{{lastName}}'}}`
 */
class MuttonCompilerWithinSingleQuoteState extends MuttonCompilerState {
  onChar(char: string) {
    if (char === SINGLE_QUOTE_CHAR) {
      this.compiler.changeToWithinVariableState();
    }
  }
}

/**
 * This state is entered when after seeing double quote inside of an expression
 *
 * Example: `{{firstName + "{{lastName}}"}}`
 */
class MuttonCompilerWithinDoubleQuoteState extends MuttonCompilerState {
  onChar(char: string) {
    if (char === DOUBLE_QUOTE_CHAR) {
      this.compiler.changeToWithinVariableState();
    }
  }
}

export default class MuttonCompiler {
  private compiled: MuttonCompiledTemplate;
  private previousNodeEnd = -1;
  private position: number = 0;
  private template: string;
  private state: MuttonCompilerState;

  private withinVariableState: MuttonCompilerWithinVariableState;
  private withinSingleQuoteState: MuttonCompilerWithinSingleQuoteState;
  private withinDoubleQuoteState: MuttonCompilerWithinDoubleQuoteState;
  private defaultState: MuttonCompilerDefaultState;

  constructor(template: string) {
    this.template = template;

    this.withinVariableState = new MuttonCompilerWithinVariableState(this);
    this.withinSingleQuoteState = new MuttonCompilerWithinSingleQuoteState(
      this
    );
    this.withinDoubleQuoteState = new MuttonCompilerWithinDoubleQuoteState(
      this
    );
    this.state = this.defaultState = new MuttonCompilerDefaultState(this);

    this.compiled = {
      nodes: [],
    };
  }

  private getTemplatePart(start: number, end: number) {
    return this.template.substring(start, end);
  }

  private addToExistingLiteralNode(index: number) {
    const nodeEndPos = this.getLiteralNodeEndPosition();
    const literalSubStart =
      this.previousNodeEnd + TEMPLATE_VARIABLE_PATTERN_LENGTH - 1;
    const literalSubEnd = nodeEndPos + 1;

    (this.compiled.nodes[
      index
    ] as MuttonCompiledLiteralNode).literal += this.getTemplatePart(
      literalSubStart,
      literalSubEnd
    );
    (this.compiled.nodes[index] as MuttonCompiledLiteralNode).end = nodeEndPos;
    this.previousNodeEnd = this.position - 1;
  }

  private getLiteralNodeEndPosition() {
    return this.position === 0 || this.position + 1 === this.template.length
      ? this.position
      : this.position - 1;
  }

  addLiteralNode() {
    const nodeEndPos = this.getLiteralNodeEndPosition();
    const literalSubStart =
      this.previousNodeEnd + TEMPLATE_VARIABLE_PATTERN_LENGTH - 1;
    const literalSubEnd = nodeEndPos + 1;

    const node: MuttonCompiledLiteralNode = {
      type: MuttonCompiledNodeType.LITERAL,
      literal: this.getTemplatePart(literalSubStart, literalSubEnd),
      start: this.previousNodeEnd + 1,
      end: nodeEndPos,
    };

    this.compiled.nodes.push(node);
    this.previousNodeEnd = this.position - 1;
  }

  addExpressionNode() {
    const expSubStart =
      this.previousNodeEnd + TEMPLATE_VARIABLE_PATTERN_LENGTH + 1;
    const expSubEnd = this.position - TEMPLATE_VARIABLE_PATTERN_LENGTH + 1;

    const node: MuttonCompiledExpressionNode = {
      type: MuttonCompiledNodeType.EXPRESSION,
      expression: this.getTemplatePart(expSubStart, expSubEnd),
      start: this.previousNodeEnd + 1,
      end: this.position,
    };

    this.compiled.nodes.push(node);
    this.previousNodeEnd = this.position;
  }

  compileTemplate() {
    while (this.position < this.template.length) {
      const char = this.template[this.position];
      this.state.onChar(char);
      this.position++;
    }

    // We reached the end of the string before exiting the `WithinVariableState`
    if (!(this.state instanceof MuttonCompilerDefaultState)) {
      const previousCompiledNodeIndex = this.compiled.nodes.length - 1;
      const previousCompiledNode = this.compiled.nodes[
        previousCompiledNodeIndex
      ];

      // If there was only one other node recorded and it was a literal, we
      // should combine these two literals into a single literal.
      if (
        previousCompiledNode &&
        previousCompiledNode.type === MuttonCompiledNodeType.LITERAL
      ) {
        this.addToExistingLiteralNode(previousCompiledNodeIndex);
      } else {
        this.addLiteralNode();
      }
    }

    return this.compiled;
  }

  getPreviousNodeEnd() {
    return this.previousNodeEnd;
  }

  changeToDefaultState() {
    this.state = this.defaultState;
  }

  changeToWithinVariableState() {
    this.state = this.withinVariableState;
  }

  changeToWithinSingleQuoteState() {
    this.state = this.withinSingleQuoteState;
  }

  changeToWithinDoubleQuoteState() {
    this.state = this.withinDoubleQuoteState;
  }

  skip(count: number) {
    this.position += count;
  }

  lookAhead(count: number): string {
    return this.template[this.position + count];
  }

  getPosition() {
    return this.position;
  }
}
