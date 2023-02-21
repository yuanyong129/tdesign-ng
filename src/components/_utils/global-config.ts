// const COMPONENT_PREFIX = 'A';
const CLASS_PREFIX = 'arco';
// const GLOBAL_CONFIG_NAME = '$arco';

export const getPrefixCls = (componentName?: string) => {
  return componentName ? `${CLASS_PREFIX}-${componentName}` : CLASS_PREFIX;
}