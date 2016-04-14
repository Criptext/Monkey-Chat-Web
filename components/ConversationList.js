import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';

class ConversationList extends Component {
	render() {
    	return (
			<ul id='mky-conversation-list'>
				{
					Object.keys(this.props.conversations).map( key => {
						const conversation = this.props.conversations[key];
						return <ConversationItem key={conversation.id} conversation={conversation} conversationSelected={this.props.conversationSelected}/>
					})
				}
			</ul>
		);
	}
}

export default ConversationList;