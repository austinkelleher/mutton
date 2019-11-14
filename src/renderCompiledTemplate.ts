import {
  MuttonCompiledTemplate,
  MuttonCompiledNodeType,
  MuttonCompiledLiteralNode,
  MuttonCompiledExpressionNode,
} from './types';

export interface MuttonRenderOptions {
  /**
   * Function that is called for every variable that found in the template
   *
   * e.g. Given the template `{{hello}} {{world}}`, `expressionEvaluator` would
   * be called twice. The first time with `hello` and the second time with `world`.
   */
  expressionEvaluator: (expression: string) => any;
}

export interface MuttonRenderAsyncOptions {
  /**
   * Async function that is called for every variable that found in the template
   *
   * e.g. Given the template `{{hello}} {{world}}`, `expressionEvaluator` would
   * be called twice. The first time with `hello` and the second time with `world`.
   */
  expressionEvaluator: (expression: string) => Promise<any>;
}

export function renderCompiledTemplateSync(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderOptions
) {
  const { expressionEvaluator } = options;
  let renderedTemplate = '';

  compiled.nodes.forEach(node => {
    if (node.type === MuttonCompiledNodeType.LITERAL) {
      renderedTemplate += (node as MuttonCompiledLiteralNode).literal;
    } else {
      const expressionNode = node as MuttonCompiledExpressionNode;
      const evaluated = expressionEvaluator(expressionNode.expression);

      if (compiled.nodes.length === 1) {
        renderedTemplate = evaluated;
      } else {
        renderedTemplate += evaluated;
      }
    }
  });

  return renderedTemplate;
}

export async function renderCompiledTemplateAsync(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderAsyncOptions
) {
  const { expressionEvaluator } = options;
  let renderedTemplate = '';

  for (const node of compiled.nodes) {
    if (node.type === MuttonCompiledNodeType.LITERAL) {
      renderedTemplate += (node as MuttonCompiledLiteralNode).literal;
    } else {
      const expressionNode = node as MuttonCompiledExpressionNode;
      const evaluated = await expressionEvaluator(expressionNode.expression);

      if (compiled.nodes.length === 1) {
        renderedTemplate = evaluated;
      } else {
        renderedTemplate += evaluated;
      }
    }
  }

  return renderedTemplate;
}
