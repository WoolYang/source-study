/**
 * 由Redux保留的私人操作类型。
 *对于任何未知的操作，您必须返回当前状态。
 * *如果当前状态未定义，则必须返回初始状态。
 * 不要直接在代码中引用这些动作类型。
 */
const ActionTypes = {
  INIT:
    '@@redux/INIT' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.'),
  REPLACE:
    '@@redux/REPLACE' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.')
}

export default ActionTypes
