import MuttonCompiler from './MuttonCompiler';
import {
  MuttonRenderOptions,
  MuttonRenderAsyncOptions,
} from './renderCompiledTemplate';
import { MuttonCompiledTemplate } from './types';
import {
  renderCompiledTemplateSync,
  renderCompiledTemplateAsync as renderAsync,
} from './renderCompiledTemplate';

export function renderTemplate(template: string, options: MuttonRenderOptions) {
  return renderCompiledTemplate(compileTemplate(template), options);
}

export function renderCompiledTemplate(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderOptions
) {
  return renderCompiledTemplateSync(compiled, options);
}

export function renderCompiledTemplateAsync(
  compiled: MuttonCompiledTemplate,
  options: MuttonRenderAsyncOptions
) {
  return renderAsync(compiled, options);
}

export function compileTemplate(template: string) {
  const compiler = new MuttonCompiler(template);
  return compiler.compileTemplate();
}

export * from './types';
