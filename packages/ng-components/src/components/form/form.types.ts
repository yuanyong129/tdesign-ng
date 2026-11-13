/** 表单布局：纵向（标签在上）或行内。 */
export type FormLayout = 'vertical' | 'inline';

/** 标签对齐方式。 */
export type FormLabelAlign = 'left' | 'right' | 'top';

/** 重置表单时的取值方式：清空或回到初始值。 */
export type FormResetType = 'empty' | 'initial';

/** 校验状态。 */
export type FormValidateStatus = 'success' | 'warning' | 'error';

/** 校验消息类型。 */
export type FormMessageType = 'error' | 'warning';

/** 规则支持的值类型。 */
export type FormRuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'email'
  | 'url'
  | 'date'
  | 'telnumber'
  | 'integer'
  | 'float';

/** 触发时机。 */
export type FormRuleTrigger = 'blur' | 'change' | 'submit';

export interface FormRuleContext {
  /** 字段名。 */
  name: string;
  /** 当前值。 */
  value: any;
  /** 当前规则。 */
  rule: FormRule;
}

export interface FormValidateResult {
  result: boolean;
  message?: string;
  type?: FormMessageType;
}

/** 单条校验规则，字段语义与 TDesign 保持一致。 */
export interface FormRule {
  /** 是否必填 */
  required?: boolean;
  /** 值类型 */
  type?: FormRuleType;
  /** 校验提示文案 */
  message?: string;
  /** 最小值，字符串/数组按长度比较，数字按大小比较 */
  min?: number;
  /** 最大值，字符串/数组按长度比较，数字按大小比较 */
  max?: number;
  /** 固定长度 */
  len?: number;
  /** 正则校验 */
  pattern?: RegExp | string;
  /** 是否允许只包含空白的字符串 */
  whitespace?: boolean;
  /** 枚举值 */
  enum?: Array<string | number>;
  /** 自定义校验，返回 false 表示不通过 */
  validator?: (
    value: any,
    context: FormRuleContext,
  ) => FormValidateResult | boolean | Promise<FormValidateResult | boolean>;
  /** 触发时机，默认 submit */
  trigger?: FormRuleTrigger | FormRuleTrigger[];
}

export type FormRules = Record<string, FormRule | FormRule[]>;

/** validate() 的返回结构。 */
export type FormValidateMessage = Record<string, FormValidateResult>;

export interface FormSubmitResult {
  validateResult: FormValidateMessage;
  fields: Record<string, any>;
}
