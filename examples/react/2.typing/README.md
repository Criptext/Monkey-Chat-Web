# Examples: 2.typing

The code about 'typing' example, here show you the code necessary to implement this behaviors.

## Code
### Receive typing
How receive the typing notification from monkey and handle the typing to individual and group conversation.

```javascript
// ------------- ON NOTIFICATION --------------- //
monkey.on('Notification', function(data){
	console.log('App - Notification');
	
	if(!data.params || !data.params.type){
		return;
	}
	let paramsType = Number(data.params.type);
	let conversationId = isConversationGroup(data.recipientId) ? data.recipientId : data.senderId;
	let conversation = store.getState().conversations[conversationId];
	if(!conversation){
    	return;
	}
	
	let conversationTmp;
	switch(paramsType) {
		case 20: {
			if(isConversationGroup(conversationId)) { // group typing
				let membersTyping = conversation.membersTyping;
				
				if(membersTyping == null){
					return;
				}
				
				if(membersTyping.indexOf(data.senderId) == -1){
					return;
				}
				
				let users = store.getState().users;
				membersTyping.splice(membersTyping.indexOf(data.senderId), 1);
				var descText = "";
				membersTyping.forEach( (monkey_id) => {
					descText += users[monkey_id].name.split(" ")[0] + ", "
				})
				if(descText != ""){
					descText = descText.replace(/,\s*$/, "");
					if(membersTyping.length > 1){
						descText += ' están escribiendo...'
					}else{
						descText += ' está escribiendo...'
					}
					
				}else{
					var members = listMembers(conversation.members);
					descText = members;
				}
				conversationTmp = {
					id: data.recipientId,
					description: descText,
					membersTyping: membersTyping,
					preview: membersTyping.length > 0 ? users[membersTyping[membersTyping - 1]].name.split(" ")[0] + ' está escribiendo...' : null
				}
				
			}else{ // individual typing
				conversationTmp = {
					id: conversationId,
					description: null,
					membersTyping: [],
					preview: null
				}
			}
			
			store.dispatch(actions.updateConversationStatus(conversationTmp));	
			break;
		}
		case 21: {
			
			if(isConversationGroup(conversationId)) { // group typing
				let membersTyping = conversation.membersTyping;
				let users = store.getState().users;
				
				if(membersTyping == null){
					membersTyping = [];
					membersTyping.push(data.senderId);
					conversationTmp = {
						id: data.recipientId,
						description: users[data.senderId].name.split(" ")[0] + ' está escribiendo...',
						membersTyping: membersTyping,
						preview: users[data.senderId].name.split(" ")[0] + ' está escribiendo...'
					}
					return store.dispatch(actions.updateConversationStatus(conversationTmp));
				}
				
				if(membersTyping.indexOf(data.senderId) > -1){
					return;
				}
				
				membersTyping.push(data.senderId);
				var descText = "";
				membersTyping.forEach( (monkey_id) => {
					descText += users[monkey_id].name.split(" ")[0] + ", "
				})
				if(descText != ""){
					descText = descText.replace(/,\s*$/, "");
					if(membersTyping.length > 1){
						descText += ' están escribiendo...'
					}else{
						descText += ' está escribiendo...'
					}
				}else{
					var members = listMembers(conversation.members);
					descText = members;
				}
				conversationTmp = {
					id: data.recipientId,
					description: descText,
					membersTyping: membersTyping,
					preview: users[data.senderId].name.split(" ")[0] + ' está escribiendo...'
				}
					
			}else{ // individual typing
				conversationTmp = {
					id: conversationId,
					description: 'typing...',
					membersTyping: [conversationId],
					preview: 'typing...'
				}
			}
			
			store.dispatch(actions.updateConversationStatus(conversationTmp));
			break;
		}
		default:
            break;
	}
});
```
### Send typing
How send typing notification.

```javascript
...
class MonkeyChat extends Component {
	constructor(props){
		super(props);
		this.handleNotifyTyping = this.handleNotifyTyping.bind(this);
	}

	render() {
		return (
			<MonkeyUI onNotifyTyping = {this.handleNotifyTyping}/>
		)
	}

	/* Notification */
	
	handleNotifyTyping(conversationId, isTyping){
		if(!isConversationGroup(conversationId)){
			monkey.sendTemporalNotification(conversationId, {type: isTyping ? 21 : 20}, null);
		}
	}
...
}
```