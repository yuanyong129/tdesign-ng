import type { FormRule, FormRuleContext, FormValidateResult } from './form.types';

const EMAIL_PATTERN = /^[\w.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
const TEL_PATTERN = /^\+?[\d\s-]{6,20}$/;
const DATE_PATTERN = /^\d{4}-\d{2}(-\d{2})?([ T]\d{2}:\d{2}(:\d{2})?)?$/;

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

function typeMatches(value: unknown, type: FormRule['type']): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'float':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'email':
      return typeof value === 'string' && EMAIL_PATTERN.test(value);
    case 'url':
      return typeof value === 'string' && URL_PATTERN.test(value);
    case 'telnumber':
      return typeof value === 'string' && TEL_PATTERN.test(value);
    case 'date':
      return typeof value === 'string' && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
    default:
      return true;
  }
}

function sizeOf(value: unknown): number {
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return Object.keys(value as object).length;
  return 0;
}

function fail(message: string, type: FormValidateResult['type'] = 'error'): FormValidateResult {
  return { result: false, message, type };
}

const SUCCESS: FormValidateResult = { result: true };

/**
 * 按 TDesign 的规则语义逐条校验，返回第一条不通过的结果。
 * 支持异步 validator：任意一条返回 Promise 时会等待它。
 */
export async function validateRules(
  value: unknown,
  rules: FormRule[],
  context: Omit<FormRuleContext, 'rule' | 'value'>,
): Promise<FormValidateResult> {
  for (const rule of rules) {
    const message = rule.message ?? '校验未通过';

    if (rule.required && isEmpty(value)) {
      return fail(rule.message ?? '必填项不能为空', 'error');
    }

    // 非必填且值为空时，其余规则不再校验
    if (isEmpty(value)) continue;

    if (typeof value === 'string' && rule.whitespace === false && value.trim() === '') {
      return fail(rule.message ?? '不能只包含空白字符');
    }

    if (rule.type && !typeMatches(value, rule.type)) {
      return fail(message);
    }

    if (rule.len !== undefined && sizeOf(value) !== rule.len) {
      return fail(message);
    }

    if (rule.min !== undefined && sizeOf(value) < rule.min) {
      return fail(message);
    }

    if (rule.max !== undefined && sizeOf(value) > rule.max) {
      return fail(message);
    }

    if (rule.enum && !rule.enum.includes(value as string | number)) {
      return fail(message);
    }

    if (rule.pattern) {
      const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
      if (typeof value !== 'string' || !pattern.test(value)) {
        return fail(message);
      }
    }

    if (rule.validator) {
      const output = await rule.validator(value, { ...context, value, rule });
      if (typeof output === 'boolean') {
        if (!output) return fail(message);
      } else if (!output.result) {
        return { result: false, message: output.message ?? message, type: output.type ?? 'error' };
      }
    }
  }

  return SUCCESS;
}

/** 把单个规则或规则数组统一成数组。 */
export function toRuleArray(rules: FormRule | FormRule[] | undefined): FormRule[] {
  if (!rules) return [];
  return Array.isArray(rules) ? rules : [rules];
}

/** 判断某条规则是否在指定时机触发，默认 submit。 */
export function triggersAt(rule: FormRule, trigger: 'blur' | 'change' | 'submit'): boolean {
  const configured = rule.trigger ?? 'submit';
  const list = Array.isArray(configured) ? configured : [configured];
  return list.includes(trigger);
}
