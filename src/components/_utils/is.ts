const opt = Object.prototype.toString;

export function isString(obj: any): obj is string {
  return opt.call(obj) === '[object String]';
}
