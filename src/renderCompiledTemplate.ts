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
  let renderedTemplateType = '';
  const renderedTemplateComponents: string[] = [];

  compiled.nodes.forEach(node => {
    if (node.type === MuttonCompiledNodeType.LITERAL) {
      renderedTemplateComponents.push(
        (node as MuttonCompiledLiteralNode).literal
      );
    } else {
      const expressionNode = node as MuttonCompiledExpressionNode;
      const evaluated = expressionEvaluator(expressionNode.expression);
      renderedTemplateComponents.push(evaluated);
      if (Array.isArray(evaluated)) {
        renderedTemplateType = 'array';
      }
    }
  });

  return getRenderedTemplate(renderedTemplateComponents, renderedTemplateType);
}

export async function renderCompiledTemplateAsync(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderAsyncOptions
) {
  const { expressionEvaluator } = options;
  let renderedTemplateType = '';
  const renderedTemplateComponents: string[] = [];

  for (const node of compiled.nodes) {
    if (node.type === MuttonCompiledNodeType.LITERAL) {
      renderedTemplateComponents.push(
        (node as MuttonCompiledLiteralNode).literal
      );
    } else {
      const expressionNode = node as MuttonCompiledExpressionNode;
      const evaluated = await expressionEvaluator(expressionNode.expression);
      renderedTemplateComponents.push(evaluated);
      if (Array.isArray(evaluated)) {
        renderedTemplateType = 'array';
      }
    }
  }

  return getRenderedTemplate(renderedTemplateComponents, renderedTemplateType);
}

function getRenderedTemplate(components: string[], type: string) {
  if (components.length === 0) {
    return '';
  }

  if (type === '') {
    return components.length > 1 ? components.join('') : components[0];
  }

  const renderedTemplate = [];
  const maxElementLength = Math.max(
    ...components.map(c => (Array.isArray(c) ? c.length : 0))
  );

  for (let i = 0; i < maxElementLength; i += 1) {
    let value = '';

    components.forEach(comp => {
      if (Array.isArray(comp)) {
        value += comp.length <= i ? '' : comp[i];
      } else {
        value += comp;
      }
    });
    renderedTemplate.push(value);
  }

  return renderedTemplate;
}
