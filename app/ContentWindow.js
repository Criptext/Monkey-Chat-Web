import React, { Component } from 'react'
import Timeline from './Timeline.js';
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';

class ContentWindow extends Component {
	render() {
		let classStateApp = '';
		let classStateWindow = '';
		let conversationName = '';
		let conversationAvatar = '';
		if(this.props.conversationSelected != undefined){
			classStateApp = 'mky-disappear';
			conversationName = this.props.conversationSelected.name;
			conversationAvatar = this.props.conversationSelected.urlAvatar;
		}else{
			classStateWindow = 'mky-disabled';
		}
    	return (
	    	<section id='mky-conversation-window' className={'mky-conversation-with '+classStateWindow}>
	    		<div id="mky-app-intro" className={classStateApp}><div></div></div>
				<header id='mky-conversation-selected-header'>
					<div id='mky-conversation-selected-image'><img src={conversationAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{conversationName}</span>
						<span id='mky-conversation-selected-status'></span>
					</div>
				</header>
				<TimelineChat conversationSelected={this.props.conversationSelected} userSessionId={this.props.userSessionId}/>
				<Input messageToSet={this.props.messageToSet} userSessionId={this.props.userSessionId}/>
				<div className="mky-signature">Powered by <a className="mky-signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div>
			</section>
		);
	}
}

export default ContentWindow;