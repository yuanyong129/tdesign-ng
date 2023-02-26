/**
 * @todo 优化判断空文本节点的方法
 */

// const regExp = /\n/g;
/** 回车符的内容 */
const blankTextContent = '\n      ';
/** 判断是否是空文本 */
const isBlankText = (node: Node): boolean => {
  const testContent = node.textContent;
  return !Boolean(testContent?.replaceAll(blankTextContent, '').trim());
}

export const isText = (node: Node): boolean => {
  return node.nodeType === Node.TEXT_NODE && (!isBlankText(node)) ;
}

export const isElement = (node: Node): boolean => {
  return Boolean(node.nodeType === Node.ELEMENT_NODE);
}

export const isComment = (node: Node): boolean => {
  return Boolean(node.nodeType === Node.COMMENT_NODE);
}

export const getAllElements = (nodes: Node[], includeText = false) => {
  return includeText 
         ? nodes.filter(node => (isElement(node) || (isText(node))))
         : nodes.filter(node => isElement(node));
}