import { ADD_CONVERSATION, DELETE_CONVERSATION, ADD_CONVERSATIONS, DELETE_CONVERSATIONS, UPDATE_CONVERSATION_STATUS, UPDATE_CONVERSATION_UNREAD_COUNTER, REMOVE_MEMBER, ADD_MESSAGE, ADD_MESSAGES, UPDATE_MESSAGE_STATUS, UPDATE_MESSAGES_STATUS, UPDATE_MESSAGE_DATA, DELETE_MESSAGE} from '../actions'

const conversations = (state = {}, action) => {
	switch(action.type) {
		case ADD_CONVERSATIONS: {
			return {
				...state,
				...action.conversations
			}
		}

		case DELETE_CONVERSATIONS: {
			return {}
		}
		
		case ADD_CONVERSATION: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: action.conversation
			}
		}

		case DELETE_CONVERSATION: {
			const conversationId = action.conversation.id;
			let newState = {
				...state,
			}
			delete newState[conversationId];
			return newState;
		}
		
		case UPDATE_CONVERSATION_STATUS: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}

		case UPDATE_CONVERSATION_UNREAD_COUNTER: {
			const conversationId = action.conversation.id;
			return {
				...state,
				[conversationId]: conversation(state[conversationId], action)
			}
		}
		
		case REMOVE_MEMBER: {
			const conversationId = action.conversationId;
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
		
		case UPDATE_MESSAGES_STATUS: {
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
			if( typeof action.conversation.description !== 'undefined') {
				return {
					...state,
					description: action.conversation.description
				}
			}else if(!action.conversation.online) {
				if(action.conversation.lastOpenMe){
					return {
						...state,
						lastOpenMe: action.conversation.lastOpenMe,
						lastOpenApp: action.conversation.lastOpenApp,
						online: action.conversation.online
					}
				}
				return {
					...state,
					lastOpenApp: action.conversation.lastOpenApp,
					online: action.conversation.online
				}
			}else{
				if(action.conversation.lastOpenMe) {
					return {
						...state,
						lastOpenMe: action.conversation.lastOpenMe,
						online: action.conversation.online
					}
				}
				return {
					...state,
					online: action.conversation.online
				}
			}
		}

		case UPDATE_CONVERSATION_UNREAD_COUNTER: {
			return {
				...state,
				unreadMessageCounter: action.unreadCounter
			}
		}
		
		case REMOVE_MEMBER: {
			return {
				...state,
				members: members(state.members, action)
			}
		}

		case ADD_MESSAGE: {
			var lastMessage;
			if(!state.lastMessage){
				lastMessage = action.message.id
			}else if(action.message.datetimeCreation < state.messages[state.lastMessage].datetimeCreation){
				lastMessage = state.lastMessage;
			}else{
				lastMessage = action.message.id
			}

			var counter = state.unreadMessageCounter;
			if(action.unread){
				counter++;
			}
			return {
				...state,
				messages: messages(state.messages, action),
				lastMessage: lastMessage,
				unreadMessageCounter : counter
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
			if(state.messages[action.message.oldId]){ 
				let lastMessage = action.message.oldId === state.lastMessage ? action.message.id : state.lastMessage;
				return {
					...state,
					messages: messages(state.messages, action),
					lastMessage: lastMessage
				}
			}else{ // to update 'state' only
				return {
					...state,
					messages: messages(state.messages, action)
				}
			}
		}
		
		case UPDATE_MESSAGES_STATUS: {
			return {
				...state,
				messages: messages(state.messages, action, state.lastOpenMe)
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

const members = (state, action) => {
	const monkeyId = action.monkeyId;
	switch (action.type) {
		case REMOVE_MEMBER: {

			const monkeyId = action.monkeyId;
			let newState = state;
			let index = newState.indexOf(monkeyId);

			if (index > -1) {
			    newState.splice(index, 1);
			}
			return newState;
		}
	}
	return state;
}

const messages = (state, action, lastOpenMe) => {
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
			if(state[action.message.oldId]){ // to update 'oldId' and other params
				const messageId = action.message.oldId;
				const newMessageId = action.message.id;
				let newState = {
					...state,
					[newMessageId]: message(state[messageId], action)
				}
				delete newState[messageId];
				return newState;
			}else{ // to update 'state' only
				const messageId = action.message.id;
				return {
					...state,
					[messageId]: message(state[messageId], action)	
				}
			}
		}
		
		case UPDATE_MESSAGES_STATUS: {
			if(action.byLastOpenMe){
				return Object.keys(state).map(messageId => {
					if(state[messageId].status !== action.status && state[messageId].datetimeCreation < lastOpenMe){
						return {
							...state[messageId],
							status: action.status
						}
					}
					return state[messageId];
					
				}).reduce((messages, message) => ({ ...messages, [message.id]: message }), {});
			}else{
				return Object.keys(state).map(messageId => {
					if(state[messageId].status === action.status){
						return state[messageId];
					}
					return {
						...state[messageId],
						status: action.status
					}
				}).reduce((messages, message) => ({ ...messages, [message.id]: message }), {});
			}
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
				data: action.message.data,
				error: action.message.error
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