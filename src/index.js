import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import promise from 'middleware/promise';

import reducers from './reducers';

import 'assets/scss/styles.scss';

import Root from 'components/Root';

const logger = createLogger({ collapsed: true });
const reducer = combineReducers(reducers);
const createStoreWithMiddleware = applyMiddleware(thunk, promise, logger)(createStore);
const store = createStoreWithMiddleware(reducer);

ReactDOM.render(
    <Provider store={store}>
        <Root />
    </Provider>,
    document.getElementById('app')
);