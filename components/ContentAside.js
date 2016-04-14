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
				<div id='mky-search-panel'>
					<input id='search-input' className='mky-search-contacts-input' type='text' placeholder='Search for people and group'/>
					<button id='mky-button-search-reset' className='mky-button-icon' onclick='resetSearchPanel()'></button>
				</div>
				<ConversationList conversations={this.props.conversations} conversationSelected={this.props.conversationSelected}/>
			</aside>
		);
	}
}

export default ContentAside;