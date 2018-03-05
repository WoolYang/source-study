import createStore from './createStore' //创建redux的store
import combineReducers from './combineReducers' //组合拆分的reducer
import bindActionCreators from './bindActionCreators' //把action转成拥有同名 keys 的对象,使用时可以直接调用
import applyMiddleware from './applyMiddleware' //自定义中间件，用于扩展redux
import compose from './compose' //从右到左组合函数
import warning from './utils/warning' //控制台警告信息提示
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

/*
 * 这是一个虚设的空函数，用于检查函数名称是否被压缩。
 * 在NODE_ENV !== 'production'即非生产环境下发现该函数名isCrushed被改变,则警告用户。
 */

function isCrushed() { }

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    "You are currently using minified code outside of NODE_ENV === 'production'. " +
    'This means that you are running a slower development build of Redux. ' +
    'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
    'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' +
    'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes
}
