import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * 创建一个用于保存状态树的redux store。
 * 改变store 数据的唯一方法是通过调用`dispatch()`。
 * 应用中有且只有一个store。要指定状态树的不同部分如何响应动作，可以使用`combineReducers`将几个reducer组合成单个reducer函数。
 * 
 * @param {Function} reducer reducer是一个函数，通过当前状态树和要处理的action返回新的状态树。
 *
 * @param {any} [preloadedState] 初始状态。您可以选择将其指定为通用应用程序中的服务器状态，或恢复先前序列化的用户会话。
 *如果使用`combineReducers`生成根reducer function，则它必须是与`combineReducers`键保持相同结构的对象。
 *
 * @param {Function} [enhancer] store增强器。 可以通过选择指定它来增强store的第三方功能，
 *如中间件，时间旅行，持久性等。Redux附带的唯一store增强器是`applyMiddleware（）`。
 * 
 * @returns {Store} redux store，让你查阅状态，dispatch action，并订阅更改。
 * 
 */
export default function createStore(reducer, preloadedState, enhancer) {
  //如果 preloadedState 是一个函数并且 enhancer 未定义时参数移位操作。
  //即当createStore接受两个参数且第二个参数为function,认为preloadedState未定义，第二个参数为enhancer。
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }


  if (typeof enhancer !== 'undefined') {
    //enhancer必须是一个function类型
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    //调用enhancer ,返回一个新强化过的 store creator
    return enhancer(createStore)(reducer, preloadedState)
  }
  //reducer必须是一个function类型
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer //初始化currentReducer为reducer
  let currentState = preloadedState //初始化currentState为preloadedState
  let currentListeners = [] //初始化currentListeners数组
  let nextListeners = currentListeners //nextListeners与currentListeners引用同一数组
  let isDispatching = false //初始化dispatch状态为false

  //如果nextListeners与currentListeners同一引用，深拷贝一个currentListeners赋值给nextListeners
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * 读取由store管理的状态树。
   *
   * @returns {any} 返回应用中当前的状态树
   */
  function getState() {
    //dispatch状态时不可用
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  /**
   * 添加一个变化监听器，当dispatch一个action时调用它，状态树的某些部分可能会发生更改。然后可以调用`getState()`在回调中读取当前的状态树。
   * 
   * 可以从变化监听器中调用`dispatch()`，并注意以下几点：
   * 
   * 1.订阅器(subscriptions) 在每次`dispatch()`调用之前都会保存快照。如果在调用侦听器时订阅或取消订阅，这对正在进行的`dispatch()`没有任何影响。
   * 然而，下一个`dispatch()`调用，无论是否嵌套，都将使用订阅列表里更新近期快照。
   * 
   * 2.订阅器不应该关注所有 state 的变化，在订阅器被调用之前，往往由于嵌套的`dispatch()`
   * 导致 state 发生多次的改变，我们应该保证所有的监听都注册在`dispatch()`之前。
   *
   * @param {Function} listener 每次dispatch时都会调用一个回调函数。
   * @returns {Function} 一个可以移除监听变化的函数
   */
  function subscribe(listener) {
    //listener必须是一个函数
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }
    //dispatch状态时不可用
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe from a ' +
        'component and invoke store.getState() in the callback to access the latest state. ' +
        'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
      )
    }

    //标记有订阅函数
    let isSubscribed = true
    //保存一份快照
    ensureCanMutateNextListeners()
    //添加一个订阅函数
    nextListeners.push(listener)

    return function unsubscribe() {
      //没有标记订阅函数时返回
      if (!isSubscribed) {
        return
      }
      //dispatch状态时不可用
      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
          'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
        )
      }
      //标没有订阅的函数
      isSubscribed = false
      //保存一份快照
      ensureCanMutateNextListeners()
      //找到当前的订阅函数
      const index = nextListeners.indexOf(listener)
      //移除当前的订阅函数
      nextListeners.splice(index, 1)
    }
  }

  /**
   * dispath action。 触发state状态改变的唯一途径。
   *
   * `reducer`函数， 用于创建store，结合当前状态树和给定的 `action`来调用。 
   * 它的返回值将被视为状态树的**下一个**状态，同时变化监听器将被通知。
   *
   * dispath基本实现仅支持普通对象操作。如果你想dispatch Promise，Observable，Thunk或其他东西，你需要将store创建函数包装到相应的中间件中。
   * 例如，请参阅`redux-thunk`的文档。 即使是中间件也会使用这种方法最终发送普通对象action。
   * 
   * @param {Object} action  表示“变更内容”的普通对象。保持action可序列化是一个好主意，这样就可以记录和重放用户会话，或使用'redux-devtools`旅行时间。
   * 一个action必须有一个`type`属性，`type`不能是`undefined`。 对action类型使用字符串常量是一个好主意。
   * 
   * @returns {Object} 为了方便起见， dispatche了相同的操作对象。
   * 
   * 请注意，如果使用了自定义中间件，它可能会将`dispatch()`包装为返回其他东西（例如，Promise）。
   *
   */
  function dispatch(action) {
    //action必须是一个普通对象
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }
    //action的type属性不能为'undefined'
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }
    //dispatch状态时不可用
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      //标记dispatch正在运行
      isDispatching = true
      //执行当前 Reducer 函数返回新的 state
      currentState = currentReducer(currentState, action)
    } finally {
      //标记dispatch结束
      isDispatching = false
    }
    //所有的的监听函数赋值给 listeners
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      //执行每一个监听函数
      listener()
    }
    //返回传入的 action 对象
    return action
  }

  /**
   * 替换store当前使用的reducer来计算state。
   *
   * 如果应用实现代码拆分并且想要动态加载某些reducer，则可能需要此操作。 如果为Redux实现热加载机制，则可能还需要此操作。
   * 
   * @param {Function} nextReducer 代替store使用的reducer。
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // 创建store时，dispatch “INIT” action ，以便每个reducer都返回其初始状态。 这有效地填充了初始状态树。
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
