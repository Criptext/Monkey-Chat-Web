import { ADD_USER_SESSION } from '../actions'

const users = (state = {}, action) => {
	switch(action.type) {
		case ADD_USER_SESSION:
			return {
				...state,
				userSession: action.user,
			}
		default:
			return state;
	}
}
export default users;