import initData from '../utils/data'

const conversations = (state, action) => {
	if (typeof state === 'undefined') {
        return initData;
    }
	switch(action.type) {
		case 'ADD_MESSAGE':
			let conversationId = action.message.recipientId;
			let conversation = state[conversationId];
			// add message
			conversation.messages[action.message.id] = action.message;
			// update last message
			conversation.lastMessage = action.message.id;
			
			return {
				...state,
				conversationId: conversation,
			}
		default: 
			return state;
	}
}

/*
const app = (state, action) => {
	if (typeof state === 'undefined') {
        return initData;
    }
	return {
		conversations: conversations(state.conversations, action)
	}
}
*/

export default conversations;