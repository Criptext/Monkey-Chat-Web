import React, { Component } from 'react'
import ConversationList from './ConversationList.js';

class ContentAside extends Component {
	render() {
    	return (
			<aside>
				<header id='mky-session-header'>
					<div id='mky-session-image'>
						<img src={this.props.userSession.urlAvatar}/>
					</div>
					<div id='mky-session-description'>
						<span id='mky-session-name'>{this.props.userSession.name}</span>
					</div>
				</header>
				<ConversationList conversations={this.props.conversations} conversationSelected={this.props.conversationSelected}/>
			</aside>
		);
	}
}

export default ContentAside;