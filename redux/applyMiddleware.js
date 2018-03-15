import compose from './compose'

/**
 * 创建一个store增强器，将中间件应用于Redux store的dispatch方法。
 * 这对于各种任务很方便，例如以简洁的方式表示异步操作，或者记录每个操作的有效负载。
 * 
 * 请参阅`redux-thunk`软件包作为Redux中间件的示例。
 * 
 * 因为中间件可能是异步的，所以应该是组合链中的第一个store增强器。
 * 
 * 注意，每个中间件将`dispatch`和`getState`方法作为命名参数。
 * 
 * @param {...Function} middlewares 要应用的中间件链。
 * @returns {Function} 应用中间件的store增强器。
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
        `Other middleware would not be applied to this dispatch.`
      )
    }
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
