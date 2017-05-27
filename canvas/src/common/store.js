/**
 * @file store 管理数据
 * @author ielgnaw <wuji0223@gmail.com>
 */

import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {batchedSubscribe} from 'redux-batched-subscribe';

const reducer = (state = {}, action) => {
    let newState = state;
    switch (action.type) {
        case 'toggleType':
            newState = Object.assign({}, state, {
                data: action.data
            });

            return newState;

        default:

            return state;
    }
};

/**
 * 让 store.dispatch 支持 array
 *
 * @type {Function}
 */
const reduxMulti = ({dispatch}) => {
    return next => action =>
        Array.isArray(action)
            ? action.filter(Boolean).map(dispatch)
            : next(action);
};

// middleware for action creators to return function and array
const createStoreWithMiddleware = applyMiddleware(
    thunk,
    reduxMulti
)(createStore);

// 确保 store.subscribe 的监听器只执行一次
const createStoreWithBatching = batchedSubscribe(
    fn => fn()
)(createStoreWithMiddleware);

const store = createStoreWithBatching(reducer);

export default store;
