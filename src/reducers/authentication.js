import Immutable from 'immutable'
import { handleActions } from 'redux-actions'
import { LOGIN, LOGOUT } from 'actions/authentication'

const DEFAULT_STATE = Immutable.Map({ active: false })

export default handleActions({
  LOGIN_PENDING: (state, action) => DEFAULT_STATE,
  LOGIN_FULFILLED: (state, action) => Immutable.Map({ token: action.payload.token, active: true }),
  LOGIN_REJECTED: (state, action) => DEFAULT_STATE,

  LOGOUT: (state, action) => DEFAULT_STATE
}, DEFAULT_STATE)

