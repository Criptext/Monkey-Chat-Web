import { ADD_CONVERSATIONS, ADD_CONVERSATION, ADD_MESSAGE } from '../actions'

const conversations = (state = {}, action) => {
	switch(action.type) {
		case ADD_CONVERSATIONS: {
			return action.conversations
		}
		
		case ADD_CONVERSATION: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: action.conversation
			}
		}
			
		case ADD_MESSAGE: {
			const conversationId = action.message.recipientId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		default:
			return state;
	}
}

const conversation = (state = {}, action) => {
	switch (action.type) {
		case ADD_MESSAGE:
			return {
				...state,
				messages: messages(state.messages, action),
				lastMessage: action.message.id
			}	
	}
	return state;
}

const messages = (state = {}, action) => {
	switch (action.type) {
		case ADD_MESSAGE:
			return {
				...state,
				[action.message.id]: action.message
			}
	}
	return state;
}

export default conversations;