import React, { Component } from 'react'

class ConversationWindow extends Component {
	render() {
    	return (
			<div className={'mky-chat-timeline-conversation '+this.props.classState} id={"mky-chat-timeline-conversation-"+this.props.conversation.id}></div>
		);
	}
}

export default ConversationWindow;