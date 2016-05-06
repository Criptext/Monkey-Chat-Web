
export const isConversationGroup = (conversationId) => {
	let result = false;
    if(conversationId.indexOf("G:") >= 0){
        result = true;
    }
    return result;
}