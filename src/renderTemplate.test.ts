import { renderTemplate } from './';
import { runFixtureTests } from '../test/fixtures';

runFixtureTests(fixture => () => {
  const onExpressionCalls: string[] = [];

  const rendered = renderTemplate(fixture.template, {
    expressionEvaluator(expression: string) {
      onExpressionCalls.push(expression);

      if (fixture.expressionEvaluator) {
        return fixture.expressionEvaluator(expression);
      }

      return expression;
    },
  });

  expect(onExpressionCalls).toEqual(fixture.expressionCalls);
  expect(rendered).toEqual(fixture.renderResult);
});
