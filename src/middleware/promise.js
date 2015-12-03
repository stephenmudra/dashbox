import { isFSA } from 'flux-standard-action'
import isPromise from 'utils/is-promise'

export default function promise ({ dispatch }) {
  return next => action => {
    if (!isFSA(action)) return isPromise(action) ? action.then(dispatch) : next(action)
    if (!isPromise(action.payload)) return next(action)

    dispatch({
      type: action.type + '_PENDING',
      payload: undefined
    })

    return action.payload.then(
      result => dispatch({
        ...action,
        type: action.type + '_FULFILLED',
        payload: result
      }),

      error => dispatch({
        ...action,
        type: action.type + '_REJECTED',
        payload: error
      })
    )
  }
}
