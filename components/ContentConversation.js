import React, { Component } from 'react';
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import LocationInput from './LocationInput.js';
import ContentModal from './ContentModal.js';

import { defineTime } from '../utils/monkey-utils.js'

class ContentConversation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showLocationInput: false,
			messageSelected: undefined
		}
		this.handleMessageSelected = this.handleMessageSelected.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
		this.listMembers = this.listMembers.bind(this);
	}

	componentWillReceiveProps(nextProps){
		if(this.props.conversationSelected != nextProps.conversationSelected){
			this.setState({
				showLocationInput: false,
				messageSelected: undefined
			});
		}
	}

	render() {
		return (
	    	<div className='mky-content-conversation'>
				<header id='mky-conversation-selected-header'>
					<div id='mky-conversation-selected-image'><img src={this.props.conversationSelected.urlAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{this.props.conversationSelected.name}</span>
						{ this.props.conversationSelected.lastOpenApp
							? ( this.props.conversationSelected.online == 0 
								? <span id='mky-conversation-selected-status'> {'Last seen ' + defineTime(this.props.conversationSelected.lastOpenApp * 1000)}</span>
								: <span id='mky-conversation-selected-status'> online </span>
							)	
							: <span id='mky-conversation-selected-status'> {this.listMembers(this.props.conversationSelected.members)}</span>
						}
					</div>
					<div className='mky-signature'>Powered by <a className='mky-signature-link' target='_blank' href='http://criptext.com/'>Criptext</a></div>
				</header>
				{ this.state.showLocationInput
					? <LocationInput messageCreated={this.props.messageCreated} disableGeoInput={this.disableGeoInput.bind(this)} />
					: ( <div className='mky-chat-area'>
							<TimelineChat loadMessages={this.props.loadMessages} conversationSelected={this.props.conversationSelected} messageSelected={this.handleMessageSelected}/>
							{ this.state.messageSelected 
								? <ContentModal messageSelected={this.state.messageSelected}  showModal={this.handleShowModal}/>
								: null
							}
							<Input enableGeoInput={this.enableGeoInput.bind(this)} messageCreated={this.props.messageCreated}/>
						</div>
					)
				}
			</div>
		)
	}

	handleMessageSelected(message){
		this.setState({messageSelected:message});
	}

	handleShowModal(){
		this.setState({messageSelected: undefined});
	}
	
	listMembers(members){
/*
		var list = [];
			this.props.conversationSelected.members.map(function(member) {
				list.push(member.name);
            })
		return list.join(', ');
*/
		return 'group conversation';
	}

	enableGeoInput(){
		this.setState({showLocationInput: true});
	}

	disableGeoInput(){
		this.setState({showLocationInput: false});
	}
}

export default ContentConversation;