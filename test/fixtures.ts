import {
  MuttonCompiledNodeType,
  MuttonCompiledTemplate,
  MuttonCompiledExpressionNode,
  MuttonCompiledLiteralNode,
} from '../src/types';

interface EvaluatorTestFixture {
  desc: string;
  skip?: boolean;
  only?: boolean;
  template: string;
  expressionCalls: string[];
  renderResult: any;
  compiled: MuttonCompiledTemplate;
  expressionEvaluator?: (expression: string) => any;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

function getExpressioNode(
  data: Omit<MuttonCompiledExpressionNode, 'type'>
): MuttonCompiledExpressionNode {
  return {
    type: MuttonCompiledNodeType.EXPRESSION,
    ...data,
  };
}

function getLiteralNode(
  data: Omit<MuttonCompiledLiteralNode, 'type'>
): MuttonCompiledLiteralNode {
  return {
    type: MuttonCompiledNodeType.LITERAL,
    ...data,
  };
}

export function runFixtureTests(
  testFn: (fixture: EvaluatorTestFixture) => any
) {
  for (const fixture of fixtures) {
    if (fixture.skip) {
      test.skip(fixture.desc, testFn(fixture));
    } else if (fixture.only) {
      test.only(fixture.desc, testFn(fixture));
    } else {
      test(fixture.desc, testFn(fixture));
    }
  }
}

export const fixtures: EvaluatorTestFixture[] = [
  {
    desc: 'should render basic template with single variable',
    template: '{{hopper}}',
    expressionCalls: ['hopper'],
    renderResult: 'hopper',
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopper',
          start: 0,
          end: 9,
        }),
      ],
    },
  },
  {
    desc: 'should allow multiple template variables in template',
    template: '{{hopper}} {{mochi}}',
    expressionCalls: ['hopper', 'mochi'],
    renderResult: 'hopper mochi',
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopper',
          start: 0,
          end: 9,
        }),
        getLiteralNode({
          literal: ' ',
          start: 10,
          end: 10,
        }),
        getExpressioNode({
          expression: 'mochi',
          start: 11,
          end: 19,
        }),
      ],
    },
  },
  {
    desc: 'should allow multiple expressions back to back',
    template: '{{hopper}}{{mochi}}',
    expressionCalls: ['hopper', 'mochi'],
    renderResult: 'hoppermochi',
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopper',
          start: 0,
          end: 9,
        }),
        getExpressioNode({
          expression: 'mochi',
          start: 10,
          end: 18,
        }),
      ],
    },
  },
  {
    desc:
      'should allow starting with a string literal and ending with an expression',
    template: 'Hello {{hopper}} World {{mochi}}',
    expressionCalls: ['hopper', 'mochi'],
    renderResult: 'Hello hopper World mochi',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: 'Hello ',
          start: 0,
          end: 5,
        }),
        getExpressioNode({
          expression: 'hopper',
          start: 6,
          end: 15,
        }),
        getLiteralNode({
          literal: ' World ',
          start: 16,
          end: 22,
        }),
        getExpressioNode({
          expression: 'mochi',
          start: 23,
          end: 31,
        }),
      ],
    },
  },
  {
    desc:
      'should allow starting with a string literal and ending with a string literal',
    template: 'Hello {{hopper}} World {{mochi}} Test',
    expressionCalls: ['hopper', 'mochi'],
    renderResult: 'Hello hopper World mochi Test',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: 'Hello ',
          start: 0,
          end: 5,
        }),
        getExpressioNode({
          expression: 'hopper',
          start: 6,
          end: 15,
        }),
        getLiteralNode({
          literal: ' World ',
          start: 16,
          end: 22,
        }),
        getExpressioNode({
          expression: 'mochi',
          start: 23,
          end: 31,
        }),
        getLiteralNode({
          literal: ' Test',
          start: 32,
          end: 36,
        }),
      ],
    },
  },
  {
    desc:
      'should return expression value type if only single variable present and alone',
    template: '{{hopperAge}}',
    expressionCalls: ['hopperAge'],
    renderResult: 1,
    expressionEvaluator(expression: string) {
      return 1;
    },
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopperAge',
          start: 0,
          end: 12,
        }),
      ],
    },
  },
  {
    desc:
      'should concat rendered string if any characters before single variable and then end template',
    template: ' {{hopperAge}}',
    expressionCalls: ['hopperAge'],
    renderResult: ' 1',
    expressionEvaluator(expression: string) {
      return 1;
    },
    compiled: {
      nodes: [
        getLiteralNode({
          literal: ' ',
          start: 0,
          end: 0,
        }),
        getExpressioNode({
          expression: 'hopperAge',
          start: 1,
          end: 13,
        }),
      ],
    },
  },
  {
    desc:
      'should concat rendered string if any characters after single variable and then additional characters at end',
    template: '{{hopperAge}} ',
    expressionCalls: ['hopperAge'],
    renderResult: '1 ',
    expressionEvaluator(expression: string) {
      return 1;
    },
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopperAge',
          start: 0,
          end: 12,
        }),
        getLiteralNode({
          literal: ' ',
          start: 13,
          end: 13,
        }),
      ],
    },
  },
  {
    desc: 'should allow new lines',
    template: `{{hopper}}

{{mochi}}
`,
    expressionCalls: ['hopper', 'mochi'],
    renderResult: `hopper

mochi
`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopper',
          start: 0,
          end: 9,
        }),
        getLiteralNode({
          literal: '\n\n',
          start: 10,
          end: 11,
        }),
        getExpressioNode({
          expression: 'mochi',
          start: 12,
          end: 20,
        }),
        getLiteralNode({
          literal: '\n',
          start: 21,
          end: 21,
        }),
      ],
    },
  },
  {
    desc: 'should render single character string literal',
    template: 'a',
    expressionCalls: [],
    renderResult: 'a',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: 'a',
          start: 0,
          end: 0,
        }),
      ],
    },
  },
  {
    desc: 'should render single character brace',
    template: '{',
    expressionCalls: [],
    renderResult: '{',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{',
          start: 0,
          end: 0,
        }),
      ],
    },
  },
  {
    desc: 'should render double character starting braces',
    template: '{{',
    expressionCalls: [],
    renderResult: '{{',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{{',
          start: 0,
          end: 1,
        }),
      ],
    },
  },
  {
    desc: 'should render single character end brace',
    template: '}',
    expressionCalls: [],
    renderResult: '}',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '}',
          start: 0,
          end: 0,
        }),
      ],
    },
  },
  {
    desc: 'should render double character ending braces',
    template: '}}',
    expressionCalls: [],
    renderResult: '}}',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '}}',
          start: 0,
          end: 1,
        }),
      ],
    },
  },
  {
    desc:
      'should create literal node if template starts with {{ and never has }}',
    template: '{{ ',
    expressionCalls: [],
    renderResult: '{{ ',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{{ ',
          start: 0,
          end: 2,
        }),
      ],
    },
  },
  {
    desc:
      'should create literal node if template starts with literal then has {{ and immediately ends',
    template: ' {{',
    expressionCalls: [],
    renderResult: ' {{',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: ' {{',
          start: 0,
          end: 2,
        }),
      ],
    },
  },
  {
    desc:
      'should create literal node if template starts with literal then has {{ and never has }}',
    template: ' {{ ',
    expressionCalls: [],
    renderResult: ' {{ ',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: ' {{ ',
          start: 0,
          end: 3,
        }),
      ],
    },
  },
  {
    desc:
      'should create single literal node if starts with expression and ends with literal containing {{',
    template: '{{hopper}} {{ ',
    expressionCalls: ['hopper'],
    renderResult: 'hopper {{ ',
    compiled: {
      nodes: [
        getExpressioNode({
          expression: 'hopper',
          start: 0,
          end: 9,
        }),
        getLiteralNode({
          literal: ' {{ ',
          start: 10,
          end: 13,
        }),
      ],
    },
  },
  {
    desc:
      'should create two literal nodes if starts with literal, then expression, and ends with literal containing {{',
    template: ' {{hopper}} {{ ',
    expressionCalls: ['hopper'],
    renderResult: ' hopper {{ ',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: ' ',
          start: 0,
          end: 0,
        }),
        getExpressioNode({
          expression: 'hopper',
          start: 1,
          end: 10,
        }),
        getLiteralNode({
          literal: ' {{ ',
          start: 11,
          end: 14,
        }),
      ],
    },
  },
  {
    desc:
      'should treat single quotes wrapped around an expression as a literal and an expression',
    template: `'{{hopper}}'`,
    expressionCalls: ['hopper'],
    renderResult: `'hopper'`,
    compiled: {
      nodes: [
        getLiteralNode({
          literal: `'`,
          start: 0,
          end: 0,
        }),
        getExpressioNode({
          expression: 'hopper',
          start: 1,
          end: 10,
        }),
        getLiteralNode({
          literal: `'`,
          start: 11,
          end: 11,
        }),
      ],
    },
  },
  {
    desc:
      'should treat double quotes wrapped around an expression as a literal and an expression',
    template: `"{{hopper}}"`,
    expressionCalls: ['hopper'],
    renderResult: '"hopper"',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '"',
          start: 0,
          end: 0,
        }),
        getExpressioNode({
          expression: 'hopper',
          start: 1,
          end: 10,
        }),
        getLiteralNode({
          literal: '"',
          start: 11,
          end: 11,
        }),
      ],
    },
  },
  {
    desc:
      'should treat single quotes wrapped around expression inside of expression part of the existing expression',
    template: `{{hopper'{{hopper}}'}}`,
    expressionCalls: [`hopper'{{hopper}}'`],
    renderResult: `hopper'{{hopper}}'`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `hopper'{{hopper}}'`,
          start: 0,
          end: 21,
        }),
      ],
    },
  },
  {
    desc:
      'should treat double quotes wrapped around expression inside of expression part of the existing expression',
    template: `{{hopper"{{hopper}}"}}`,
    expressionCalls: [`hopper"{{hopper}}"`],
    renderResult: `hopper"{{hopper}}"`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `hopper"{{hopper}}"`,
          start: 0,
          end: 21,
        }),
      ],
    },
  },
  {
    desc:
      'should consider entire template as a literal if no end single quote inside of single expression',
    template: `{{hopper'{{hopper}}}}`,
    expressionCalls: [],
    renderResult: "{{hopper'{{hopper}}}}",
    compiled: {
      nodes: [
        getLiteralNode({
          literal: "{{hopper'{{hopper}}}}",
          start: 0,
          end: 20,
        }),
      ],
    },
  },
  {
    desc:
      'should consider entire template as a literal if no end double quote inside of single expression',
    template: '{{hopper"{{hopper}}}}',
    expressionCalls: [],
    renderResult: '{{hopper"{{hopper}}}}',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{{hopper"{{hopper}}}}',
          start: 0,
          end: 20,
        }),
      ],
    },
  },
  {
    desc:
      'should support additional parts of expression after single quotes inside of expression',
    template: "{{hopper '{{hopper}}' hopper}}",
    expressionCalls: ["hopper '{{hopper}}' hopper"],
    renderResult: "hopper '{{hopper}}' hopper",
    compiled: {
      nodes: [
        getExpressioNode({
          expression: "hopper '{{hopper}}' hopper",
          start: 0,
          end: 29,
        }),
      ],
    },
  },
  {
    desc:
      'should support additional parts of expression after double quotes inside of expression',
    template: `{{hopper "{{hopper}}" hopper}}`,
    expressionCalls: [`hopper "{{hopper}}" hopper`],
    renderResult: `hopper "{{hopper}}" hopper`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `hopper "{{hopper}}" hopper`,
          start: 0,
          end: 29,
        }),
      ],
    },
  },
  {
    desc:
      'should support entering single quotes without braces inside at start of expression',
    template: `{{'hopper'}}`,
    expressionCalls: [`'hopper'`],
    renderResult: `'hopper'`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `'hopper'`,
          start: 0,
          end: 11,
        }),
      ],
    },
  },
  {
    desc:
      'should support entering double quotes without braces inside at start of expression',
    template: `{{"hopper"}}`,
    expressionCalls: [`"hopper"`],
    renderResult: `"hopper"`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `"hopper"`,
          start: 0,
          end: 11,
        }),
      ],
    },
  },
  {
    desc:
      'should support entering single quotes with braces inside at start of expression',
    template: `{{'{{hopper}}'}}`,
    expressionCalls: [`'{{hopper}}'`],
    renderResult: `'{{hopper}}'`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `'{{hopper}}'`,
          start: 0,
          end: 15,
        }),
      ],
    },
  },
  {
    desc:
      'should support entering double quotes with braces inside at start of expression',
    template: `{{"{{hopper}}"}}`,
    expressionCalls: [`"{{hopper}}"`],
    renderResult: `"{{hopper}}"`,
    compiled: {
      nodes: [
        getExpressioNode({
          expression: `"{{hopper}}"`,
          start: 0,
          end: 15,
        }),
      ],
    },
  },
  {
    desc:
      'should compile only literal node if braces start, then single quote, and no end braces',
    template: "{{'hello",
    expressionCalls: [],
    renderResult: "{{'hello",
    compiled: {
      nodes: [
        getLiteralNode({
          literal: "{{'hello",
          start: 0,
          end: 7,
        }),
      ],
    },
  },
  {
    desc:
      'should compile only literal node if braces start, then double quote, and no end braces',
    template: '{{"hello',
    expressionCalls: [],
    renderResult: '{{"hello',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{{"hello',
          start: 0,
          end: 7,
        }),
      ],
    },
  },
  {
    desc:
      'should compile only literal node if braces start, then single quotes, and no end braces',
    template: "{{'hello'",
    expressionCalls: [],
    renderResult: "{{'hello'",
    compiled: {
      nodes: [
        getLiteralNode({
          literal: "{{'hello'",
          start: 0,
          end: 8,
        }),
      ],
    },
  },
  {
    desc:
      'should compile only literal node if braces start, then double quotes, and no end braces',
    template: '{{"hello"',
    expressionCalls: [],
    renderResult: '{{"hello"',
    compiled: {
      nodes: [
        getLiteralNode({
          literal: '{{"hello"',
          start: 0,
          end: 8,
        }),
      ],
    },
  },
];
