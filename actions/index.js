export const ADD_USER_SESSION = 'ADD_USER_SESSION'
export const ADD_MESSAGE = 'ADD_MESSAGE'
export const ADD_CONVERSATION = 'ADD_CONVERSATION'

export const addMessage = (message) => {
	return {
		type: ADD_MESSAGE,
		message: message
	}
}

export const addConversation = (conversation) => {
	return {
		type: ADD_CONVERSATION,
		conversation: conversation
	}
}

export const addUserSession = (user) => {
	return {
		type: ADD_USER_SESSION,
		user: user
	}
}