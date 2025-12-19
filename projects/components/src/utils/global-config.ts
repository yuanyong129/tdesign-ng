import { ArcoOptions } from "./types";

const COMPONENT_PREFIX = 'A';
const CLASS_PREFIX = 'arco';
const GLOBAL_CONFIG_NAME = '$arco';

export const getComponentPrefix = (options?: ArcoOptions) => {
  return options?.componentPrefix ?? COMPONENT_PREFIX;
};

export const getPrefixCls = (componentName?: string): string => {
  const prefix = CLASS_PREFIX;
  if (componentName) {
    return `${prefix}-${componentName}`;
  }
  return prefix;
};
