import React, { Component } from 'react';
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import SimpleMapPage from './Gmap.js';

class ContentConversation extends Component {
	render() {
    	return (
	    	<div className='mky-content-conversation'>
				<header id='mky-conversation-selected-header'>
					<div id='mky-conversation-selected-image'><img src={this.props.conversationSelected.urlAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{this.props.conversationSelected.name}</span>
						<span id='mky-conversation-selected-status'></span>
					</div>
				</header>
				<TimelineChat conversationSelected={this.props.conversationSelected}/>
				<Input messageCreated={this.props.messageCreated}/>
				<div className='mky-signature'>Powered by <a className='mky-signature-link' target='_blank' href='http://criptext.com/'>Criptext</a></div>
			</div>
		)
	}
}

export default ContentConversation;