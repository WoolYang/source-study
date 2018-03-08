/**
 *
 * 从右向左组合单参数函数。最右边的函数可以接受多个参数，因为它提供了签名由此产生的复合函数。
 * 
 * @param {...Function} funcs 组合的函数
 * @returns {Function} 通过从右向左组合参数函数获得新函数，例如compose(f, g, h) 和 (...args) => f(g(h(...args)))是相同的。
 * 
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
