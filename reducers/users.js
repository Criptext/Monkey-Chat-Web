import { ADD_USER } from '../actions'

const users = (state = {}, action) => {
	switch(action.type) {
		case ADD_USER:
			return {
				...state,
				userSession: action.user,
			}
		default: 
			return state;
	}
}
export default users;