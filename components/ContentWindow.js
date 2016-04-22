import React, { Component } from 'react'
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import SimpleMapPage from './Gmap.js';

class ContentWindow extends Component {
	constructor(props){
		super(props);
		this.state = {
			classStateWindow: '',
			classStateApp: ''
		}
		this.conversationName;
		this.conversationAvatar;
		this.classExpand = 'mky-conversation-with';
	}
	
	componentWillMount() {
		if(this.props.conversationSelected != undefined){
			this.setState({classStateApp: 'mky-disappear'});
			this.conversationName = this.props.conversationSelected.name;
			this.conversationAvatar = this.props.conversationSelected.urlAvatar;
		}else{
			this.setState({classStateWindow: 'mky-disabled'});
		}
		
		if(this.props.expandWindow){
			this.classExpand = 'mky-conversation-only';
		}
	}
	
	render() {
    	return (
	    	<section id='mky-conversation-window' className={this.classExpand+' '+this.state.classStateWindow}>
	    		<div id="mky-app-intro" className={this.state.classStateApp}><div></div></div>
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