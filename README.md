# mutton

A simple and very lightweight mustache-like template compiler and renderer. The
values of template variables are computed using a function that is provided by
the user. Additionally, if the template contains exactly one variable and
nothing else, the original type of the computed value is preserved. See the
usage section below for examples.

## Installation

```
npm install mutton --save
```

## Usage

### Rendering

Simple templated rendered:

```typescript
import { renderTemplate } from 'mutton';

const data = {
  name: 'Austin',
  age: 9001,
};

const rendered = renderTemplate(
  'My name is {{name}} and I am {{age}} years old',
  {
    expressionEvaluator(expression: string) {
      return data[expression];
    },
  }
);

console.log(rendered); // My name is Austin and I am 9001 years old
```

Template where the original computed value type is preserved:

```typescript
import { renderTemplate } from 'mutton';

const data = {
  age: 9001,
};

const rendered = renderTemplate('{{age}}', {
  expressionEvaluator(expression: string) {
    return data[expression];
  },
});

console.log(rendered, typeof rendered); // 9001 'number'
```

### Compiling

`mutton` supports compiling the template and then rendering from a compiled
template later.

```typescript
import { compileTemplate, renderCompiledTemplate } from 'mutton';

const data = {
  name: 'Austin',
};

/**
 * {
 *   nodes: [
 *     {
 *       type: 'literal',
 *       literal: 'Hello ',
 *       start: 0,
 *       end: 5
 *     },
 *     {
 *       type: 'expression',
 *       expression: 'name',
 *       start: 6,
 *       end: 13
 *     }
 *   ]
 * }
 */
const compiled = compileTemplate('Hello {{name}}');
const rendered = renderCompiledTemplate(compiled, {
  expressionEvaluator(expression: string) {
    return data[expression]; // Austin
  },
});

console.log(rendered); // Hello Austin
```

### Usage with Jexl

[Jexl](https://github.com/TomFrost/Jexl) is a JavaScript expression language and
can be used in combination with `mutton`.

Example:

```typescript
import jexl from 'jexl';
import { renderTemplate } from 'mutton';

const data = {
  person: {
    name: 'Austin',
    age: 9011,
  },
};

const rendered = renderTemplate(
  'My name is {{person.name}} and I am {{person.age - 10}} years old',
  {
    expressionEvaluator(expression: string) {
      return jexl.evalSync(expression, data);
    },
  }
);

console.log(rendered); // My name is Austin and I am 9001 years old
```
