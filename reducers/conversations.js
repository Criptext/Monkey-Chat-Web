import { ADD_CONVERSATION, ADD_CONVERSATIONS, UPDATE_CONVERSATION_STATUS, ADD_MESSAGE, ADD_MESSAGES, UPDATE_MESSAGE_STATUS, UPDATE_MESSAGE_DATA, DELETE_MESSAGE} from '../actions'

const conversations = (state = {}, action) => {
	switch(action.type) {
		case ADD_CONVERSATIONS: {
			return {
				...state,
				...action.conversations
			}
		}
		
		case ADD_CONVERSATION: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: action.conversation
			}
		}
		
		case UPDATE_CONVERSATION_STATUS: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		
		case ADD_MESSAGE: {
			const conversationId = action.conversationId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		
		case ADD_MESSAGES: {
			const conversationId = action.conversationId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		
		case UPDATE_MESSAGE_DATA: {
			const conversationId = action.conversationId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		
		case UPDATE_MESSAGE_STATUS: {
			const conversationId = action.conversationId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}

		case DELETE_MESSAGE: {
			const conversationId = action.conversationId;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}

		default:
			return state;
	}
}

const conversation = (state, action) => {
	switch (action.type) {
		case UPDATE_CONVERSATION_STATUS: {
			if (action.conversation.online == 0){
				return {
					...state,
					lastOpenMe: action.conversation.lastOpenMe,
					lastOpenApp: action.conversation.lastOpenApp,
					online: action.conversation.online
				}
			}else{
				return {
					...state,
					lastOpenMe: action.conversation.lastOpenMe,
					online: action.conversation.online
				}
			}
		}
		
		case ADD_MESSAGE: {
			var lastMessage;
			if(action.message.datetimeCreation < state.messages[state.lastMessage].datetimeCreation){
				lastMessage = state.lastMessage;
			}else{
				lastMessage = action.message.id
			}
			return {
				...state,
				messages: messages(state.messages, action),
				lastMessage: lastMessage
			}
		}
		
		case ADD_MESSAGES: {
			return {
				...state,
				messages: messages(state.messages, action)
			}
		}
		
		case UPDATE_MESSAGE_DATA: {
			return {
				...state,
				messages: messages(state.messages, action)
			}
		}
		
		case UPDATE_MESSAGE_STATUS: {
			if(!state.messages[action.message.oldId]) // handle repeated update
				return state;
			
			let lastMessage = action.message.oldId === state.lastMessage ? action.message.id : state.lastMessage;
			return {
				...state,
				messages: messages(state.messages, action),
				lastMessage: lastMessage
			}
		}

		case DELETE_MESSAGE: {
			return {
				...state,
				messages: messages(state.messages, action),
			}
		}
	}
	return state;
}

const messages = (state, action) => {
	switch (action.type) {
		case ADD_MESSAGE: {
			return {
				...state,
				[action.message.id]: action.message
			}
		}
		
		case ADD_MESSAGES: {
			return {
				...state,
				...action.messages
			}
		}
		
		case UPDATE_MESSAGE_DATA: {
			const messageId = action.message.id;
			return {
				...state,
				[messageId]: message(state[messageId], action)
			}
		}
		
		case UPDATE_MESSAGE_STATUS: {
			const messageId = action.message.oldId;
			const newMessageId = action.message.id;
			let newState = {
				...state,
				[newMessageId]: message(state[messageId], action)
			}
			delete newState[messageId];
			return newState;
		}

		case DELETE_MESSAGE: {
			const deleteMessageId = action.message.id;
			let newState = {
				...state,
			}
			delete newState[deleteMessageId];
			return newState;
		}
	}
	return state;
}

const message = (state, action) => {
	switch (action.type) {
		case UPDATE_MESSAGE_DATA: {
			return {
				...state,
				data: action.message.data
			}
		}
		
		case UPDATE_MESSAGE_STATUS: {
			return {
				...state,
				id: action.message.id,
				status: action.message.status
			}
		}
	}
	return state;
}

export default conversations;