/**
 * 用于检测一个参数是否为一个普通对象。
 * @param {any} obj 要检查的对象。
 * @returns {boolean} 如果参数是一个普通对象，则为真。
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
