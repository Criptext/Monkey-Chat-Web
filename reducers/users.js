import { ADD_USER_SESSION, ADD_USER_CONTACT } from '../actions'

const users = (state = {}, action) => {
	switch(action.type) {
		case ADD_USER_SESSION:
			return {
				...state,
				userSession: action.user,
			}
			
		case ADD_USER_CONTACT:
			const userId = action.user.id;
			return {
				...state,
				[userId]: action.user,
			}
		default:
			return state;
	}
}

export default users;