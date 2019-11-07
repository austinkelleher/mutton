import MuttonCompiler from './MuttonCompiler';
import { MuttonRenderOptions } from './renderCompiledTemplate';
import { MuttonCompiledTemplate } from './types';
import renderCompiled from './renderCompiledTemplate';

export function renderTemplate(template: string, options: MuttonRenderOptions) {
  return renderCompiledTemplate(compileTemplate(template), options);
}

export function renderCompiledTemplate(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderOptions
) {
  return renderCompiled(compiled, options);
}

export function compileTemplate(template: string) {
  const compiler = new MuttonCompiler(template);
  return compiler.compileTemplate();
}

export * from './types';
