import React, { Component } from 'react'

class ConversationItem extends Component {

	render() {
    	return (
			<li id={'conversation-'+this.props.conversation.id} className='mky-conversation-unselected' onClick={this.openConversation.bind(this, this.props.conversation)}>
				<div className='mky-conversation-image'><img src={this.props.conversation.urlAvatar} onerror='imgError(this);'/></div>
				<div className='mky-conversation-description'>
					<div className='mky-conversation-name'><span className='mky-ellipsify'>{this.props.conversation.name}</span></div>
					<div className="mky-conversation-state"><span className="mky-ellipsify">Last message</span></div>
				</div>
			</li>
		);
	}
	
	openConversation(conversation){
		this.props.conversationSelected(conversation);
		//this.state.classState = 'mky-conversation-selected'
	}
}

export default ConversationItem;