import React, { Component } from 'react'
import ConversationList from './ConversationList.js';

class ContentAside extends Component {
	constructor(props, context) {
		super(props);
		context.userSession;
		this.logout = this.logout.bind(this);
	}
	render() {
    	return (
			<aside>
				<header id='mky-session-header'>
					<div id='mky-session-image'>
						<img src={this.context.userSession.urlAvatar}/>
					</div>
					<div id='mky-session-description'>
						<span id='mky-session-name2'>{this.context.userSession.name}</span>
						<div className="mky-header-exit" onClick={this.logout}><i className="demo-icon mky-logout">&#xe807;</i></div>

					</div>
				</header>
				<ConversationList conversations={this.props.conversations} conversationSelected={this.props.conversationSelected}/>
			</aside>
		)
	}

	logout(){
		this.props.userSessionLogout();
	}
}

ContentAside.contextTypes = {
    userSession: React.PropTypes.object.isRequired
}

export default ContentAside;
