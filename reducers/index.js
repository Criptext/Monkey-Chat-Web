import { combineReducers } from 'redux'
import users from './users'
import conversations from './conversations'

const reducer = combineReducers({
	conversations,
	users
})

export default reducer