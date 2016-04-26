import React, { Component } from 'react'
import ConversationList from './ConversationList.js';

class ContentAside extends Component {
	constructor(props, context) {
		super(props);
		context.userSession;
	}
	render() {
    	return (
			<aside>
				<header id='mky-session-header'>
					<div id='mky-session-image'>
						<img src={this.context.userSession.urlAvatar}/>
					</div>
					<div id='mky-session-description'>
						<span id='mky-session-name'>{this.context.userSession.name}</span>
					</div>
				</header>
				<ConversationList conversations={this.props.conversations} conversationSelected={this.props.conversationSelected}/>
			</aside>
		);
	}
}

ContentAside.contextTypes = {
    userSession: React.PropTypes.object.isRequired
}

export default ContentAside;