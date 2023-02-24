const regExp = /\n/g;

export const isText = (node: Node): boolean => {
  return node.nodeType === Node.TEXT_NODE && (!regExp.test(node.textContent?.trim() ?? '')) ;
}

export const isElement = (node: Node): boolean => {
  return Boolean(node.nodeType === Node.ELEMENT_NODE);
}

export const isComment = (node: Node): boolean => {
  return Boolean(node.nodeType === Node.COMMENT_NODE);
}

export const getAllElements = (nodes: Node[], includeText = false) => {
  return includeText ? nodes.filter(node => (isElement(node) && (isText(node)))) : [];
}