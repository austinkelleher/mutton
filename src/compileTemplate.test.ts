import { compileTemplate } from './';
import { runFixtureTests } from '../test/fixtures';

runFixtureTests(fixture => () => {
  const compiled = compileTemplate(fixture.template);
  expect(compiled).toEqual(fixture.compiled);
});
