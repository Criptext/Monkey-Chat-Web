import React, { Component } from 'react';
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import LocationInput from './LocationInput.js';
import ContentModal from './ContentModal.js';

class ContentConversation extends Component {
	constructor(props) {
		super(props);
			this.state = {
				showLocationInput: false,
				messageSelected:undefined,
			}
		this.handleMessageSelected = this.handleMessageSelected.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);

	}

	enableGeoInput(){
		this.setState({showLocationInput: true});
	}

	disableGeoInput(){
		this.setState({showLocationInput: false});
	}

	componentWillReceiveProps(nextProps){
		if(this.props.conversationSelected != nextProps.conversationSelected){
			this.setState({
				showLocationInput: false,
				messageSelected:undefined
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
						<span id='mky-conversation-selected-status'></span>
					</div>
					<div className='mky-signature'>Powered by <a className='mky-signature-link' target='_blank' href='http://criptext.com/'>Criptext</a></div>
				</header>
				{ this.state.showLocationInput
					? <LocationInput messageCreated={this.props.messageCreated} disableGeoInput={this.disableGeoInput.bind(this)} />
					: ( <div className='mky-chat-area'>
							<TimelineChat conversationSelected={this.props.conversationSelected} messageSelected={this.handleMessageSelected}/>
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
		this.setState({messageSelected:undefined});
	}
}

export default ContentConversation;