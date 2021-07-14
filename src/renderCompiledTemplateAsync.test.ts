import { compileTemplate, renderCompiledTemplateAsync } from './';

test('should allow rendering a compiled template async', async () => {
  const compiled = compileTemplate('{{hopper}}');
  const expressionCalls: string[] = [];

  const result = await renderCompiledTemplateAsync(compiled, {
    expressionEvaluator(expression) {
      expressionCalls.push(expression);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(expression);
        }, 100);
      });
    },
  });

  expect(expressionCalls).toEqual(['hopper']);
  expect(result).toEqual('hopper');
});

test('should allow rendering a compiled template async with literal nodes', async () => {
  const compiled = compileTemplate('Hello {{hopper}}');
  const expressionCalls: string[] = [];

  const result = await renderCompiledTemplateAsync(compiled, {
    expressionEvaluator(expression) {
      expressionCalls.push(expression);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(expression);
        }, 100);
      });
    },
  });

  expect(expressionCalls).toEqual(['hopper']);
  expect(result).toEqual('Hello hopper');
});

test('should allow rendering a list compiled template async', async () => {
  const compiled = compileTemplate('{{hopper}}');
  const expressionCalls: string[] = [];

  const result = await renderCompiledTemplateAsync(compiled, {
    expressionEvaluator(expression) {
      expressionCalls.push(expression);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([expression]);
        }, 100);
      });
    },
  });

  expect(expressionCalls).toEqual(['hopper']);
  expect(result).toEqual(['hopper']);
});

test('should allow rendering a multi list compiled template async', async () => {
  const compiled = compileTemplate('{{hopper}} {{mochi}}');
  const expressionCalls: string[] = [];

  const result = await renderCompiledTemplateAsync(compiled, {
    expressionEvaluator(expression) {
      expressionCalls.push(expression);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([expression]);
        }, 100);
      });
    },
  });

  expect(expressionCalls).toEqual(['hopper', 'mochi']);
  expect(result).toEqual(['hopper mochi']);
});

test('should preserve original expression value type if single expression alone in async render', async () => {
  const compiled = compileTemplate('{{age}}');
  const expressionCalls: string[] = [];

  const result = await renderCompiledTemplateAsync(compiled, {
    expressionEvaluator(expression) {
      expressionCalls.push(expression);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(9001);
        }, 100);
      });
    },
  });

  expect(expressionCalls).toEqual(['age']);
  expect(result).toEqual(9001);
});
