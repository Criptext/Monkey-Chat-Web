import { ADD_USER_SESSION,  DELETE_USER_SESSION, ADD_USER_CONTACT, ADD_USERS_CONTACT, UPDATE_USER_SESSION } from '../actions'

const users = (state = {}, action) => {
	switch(action.type) {
		case ADD_USER_SESSION:
			return {
				...state,
				userSession: action.user,
			}
		
		case DELETE_USER_SESSION:
			return {
				userSession: null,
			}

		case ADD_USERS_CONTACT:
			return {
				...state,
				...action.users
			}
			
		case ADD_USER_CONTACT:
			const userId = action.user.id;
			return {
				...state,
				[userId]: action.user,
			}

		case UPDATE_USER_SESSION:
			return{
				...state,
				['userSession']: userSession(state['userSession'], action)
			}
		
		default:
			return state;
	}
}

const userSession = (state, action) => {
	switch(action.type) {
		case UPDATE_USER_SESSION:
			return {
				...state,
				...action.params
			}
		
		default:
			return state;
	}
}

export default users;