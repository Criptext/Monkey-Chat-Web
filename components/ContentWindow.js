import React, { Component } from 'react'
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import SimpleMapPage from './Gmap.js';

class ContentWindow extends Component {
	constructor(props){
		super(props);
		this.conversationName;
		this.conversationAvatar;
		this.classExpand = 'mky-conversation-with';
		this.classStateApp = '';
		this.classStateWindow = '';
	}
	
	componentWillMount() {
		if(this.props.conversationSelected != undefined){
			this.conversationName = this.props.conversationSelected.name;
			this.conversationAvatar = this.props.conversationSelected.urlAvatar;
		}
		
		if(this.props.expandWindow){
			this.classExpand = 'mky-conversation-only';
		}
	}
	
	render() {
		if(this.props.conversationSelected != undefined){
			this.classStateApp = 'mky-disappear';
			this.classStateWindow = '';
		}else{
			this.classStateWindow = 'mky-disabled';
		}
		
    	return (
	    	<section id='mky-conversation-window' className={this.classExpand+' '+this.classStateWindow}>
	    		<div id="mky-app-intro" className={this.classStateApp}><div></div></div>
				<header id='mky-conversation-selected-header'>
					<div id='mky-conversation-selected-image'><img src={this.conversationAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{this.conversationName}</span>
						<span id='mky-conversation-selected-status'></span>
					</div>
				</header>
				<TimelineChat conversationSelected={this.props.conversationSelected} userSessionId={this.props.userSessionId}/>
				<Input messageCreated={this.props.messageCreated} userSessionId={this.props.userSessionId}/>
				<div className="mky-signature">Powered by <a className="mky-signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div>
			</section>
		);
	}
}

export default ContentWindow;