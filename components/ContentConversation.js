import React, { Component } from 'react'
import TimelineChat from './TimelineChat.js'
import Input from './Input.js'
import LocationInput from './LocationInput.js'

import Modal from './Modal.js'

import { defineTime, isConversationGroup } from '../utils/monkey-utils.js'

class ContentConversation extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			showLocationInput: false,
			messageSelected: undefined
		}
		this.handleMessageSelected = this.handleMessageSelected.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
		this.listMembers = this.listMembers.bind(this);
		this.showAside = this.showAside.bind(this);
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
		if(this.state.messageSelected){
			const Modal_ = Modal(this.context.bubblePreviews[this.state.messageSelected.bubbleType]);
		}
		
		return (
	    	<div className='mky-content-conversation'>
				<header id='mky-conversation-selected-header'>
					{
						this.props.isMobile ?
							<div className="mky-conversation-burger" onClick={this.showAside}> <button className="burger-menu-btn"></button> </div>
							:null
					}

					<div id='mky-conversation-selected-image'><img src={this.props.conversationSelected.urlAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{this.props.conversationSelected.name}</span>
						{ !isConversationGroup(this.props.conversationSelected.id)
							? ( this.props.conversationSelected.online == 0
								? <span id='mky-conversation-selected-status'> {'Last seen ' + defineTime(this.props.conversationSelected.lastOpenApp)}</span>
								: <span id='mky-conversation-selected-status'> Online </span>
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
								? <Modal_ messageSelected={this.state.messageSelected}  showModal={this.handleShowModal}/>
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

	showAside(){
		if (this.props.isMobile) {
			this.props.expandAside(true);
		}
	}

	enableGeoInput(){
		this.setState({showLocationInput: true});
	}

	disableGeoInput(){
		this.setState({showLocationInput: false});
	}
}

ContentConversation.contextTypes = {
	bubblePreviews: React.PropTypes.object.isRequired
}

export default ContentConversation;
