# Examples: 4.message-info

The code about 'message-info' example, here show you the code necessary to implement this behaviors.

## Code
### Show message info
How show message info about the outgoing message.

```javascript
...
class MonkeyChat extends Component {
	constructor(props){
		super(props);
		
		/* options */
		this.handleMessageOptionsOutgoing = this.handleMessageOptionsOutgoing.bind(this);
		this.options = {
			message: {
				optionsToIncoming: undefined,
				optionsToOutgoing: this.handleMessageOptionsOutgoing
			}
		}
	}

	render() {
		return (
			<MonkeyUI onNotifyTyping = {this.handleNotifyTyping}/>
		)
	}

	/* Message */
	
	handleMessageOptionsOutgoing(message){
		if(store.getState().users.userSession.id != message.senderId){
			return;
		}

		var options = [];
		options.push({
			action : 'Message Info', 
			func : function(){
				this.handleSelectMessage(message)
			}.bind(this)
		});

		return options;
	}
	
	handleSelectMessage(message){
		var messageSelectedInfo = {};
		let messageUsers = [];
		let users = store.getState().users;
		let conversation = store.getState().conversations[conversationSelectedId];

		messageSelectedInfo['message'] = message;
		messageSelectedInfo['close'] = function(){
			this.setState({
				messageSelectedInfo : null,
			})
		}.bind(this);
		this.setState({ messageSelectedInfo: messageSelectedInfo });
		if(isConversationGroup(conversationSelectedId)){
			conversation.members.forEach( (member) => {
				if(!member){
					return;
				}
				let user = users[member];
				if(users.userSession.id == user.id){
					return;
				}

				if(typeof conversation.online == 'boolean'){
					if(!conversation.online){
						user.description = 'Offline';
					}
				}else{
					user.description = (conversation.online.indexOf(user.id) > -1 || users.userSession.id == user.id) ? 'Online' : 'Offline'
				}

				user.read = false;
				if(conversation.lastSeen[member] && message.datetimeCreation <= conversation.lastSeen[member]){
					user.read = true;
				}

				messageUsers.push(user);
				messageSelectedInfo['users'] = messageUsers;
				this.setState({ messageSelectedInfo: messageSelectedInfo });
			});
		}else{
			let user = users[conversationSelectedId];
			if(users.userSession.id == user.id){
				return;
			}

			user.description = conversation.description ? conversation.description : 'Offline'
			user.read = message.status == 52 ? true : false;
			messageUsers.push(user);
			messageSelectedInfo['users'] = messageUsers;
			this.setState({ messageSelectedInfo: messageSelectedInfo });
		}
	}
...
}
```