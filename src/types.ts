// Types that are shared between the compiler and renderer

export enum MuttonCompiledNodeType {
  LITERAL = 'literal',
  EXPRESSION = 'expression',
}

export interface MuttonCompiledNode {
  type: MuttonCompiledNodeType;
  start: number;
  end: number;
}

export interface MuttonCompiledLiteralNode extends MuttonCompiledNode {
  type: MuttonCompiledNodeType.LITERAL;
  literal: string;
}

export interface MuttonCompiledExpressionNode extends MuttonCompiledNode {
  type: MuttonCompiledNodeType.EXPRESSION;
  expression: string;
}

export interface MuttonCompiledTemplate {
  nodes: MuttonCompiledNode[];
}
