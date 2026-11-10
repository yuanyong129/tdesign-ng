import { TDesignOptions } from "./types";

const COMPONENT_PREFIX = 'T';
const CLASS_PREFIX = 't';
const GLOBAL_CONFIG_NAME = '$td';

export const getComponentPrefix = (options?: TDesignOptions) => {
  return options?.componentPrefix ?? COMPONENT_PREFIX;
};

export const getPrefixCls = (componentName?: string): string => {
  const prefix = CLASS_PREFIX;
  if (componentName) {
    return `${prefix}-${componentName}`;
  }
  return prefix;
};
