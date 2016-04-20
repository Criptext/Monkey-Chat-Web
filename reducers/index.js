import conversations from '../utils/data'

export default function messages(state, action) {
	if (typeof state === 'undefined') {
        return conversations;
    }
	switch(action.type) {
		case 'SAVE_MESSAGE': {
			return action.conversations;
		}
		break;	
	}
}