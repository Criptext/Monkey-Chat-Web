import React, { Component } from 'react';
import TimelineChat from './TimelineChat.js';
import Input from './Input.js';
import LocationInput from './LocationInput.js';
import ContentViewer from './ContentViewer.js';

class ContentConversation extends Component {
	constructor(props) {
		super(props);
			this.state = {
				option: 0,
				image_data:undefined
			}
		this.handleImageSelected = this.handleImageSelected.bind(this);
	}

	enableGeoInput(){
		this.setState({
			option : 1
		});
	}

	disableGeoInput(){
		this.setState({
			option : 0
		});
	}

	componentWillReceiveProps(nextProps){
		if(this.props.conversationSelected != nextProps.conversationSelected){
			this.setState({
				option: 0
			});
		}
	}

	render() {
		if(this.state.option == 1){
	    	return (
		    	<div className='mky-content-conversation'>
					<header id='mky-conversation-selected-header'>
						<div id='mky-conversation-selected-image'><img src={this.props.conversationSelected.urlAvatar}/></div>
						<div id='mky-conversation-selected-description'>
							<span id='mky-conversation-selected-name'>{this.props.conversationSelected.name}</span>
							<span id='mky-conversation-selected-status'></span>
						</div>
					</header>
					<LocationInput messageCreated={this.props.messageCreated} disableGeoInput={this.disableGeoInput.bind(this)} />
					<div className='mky-signature'>Powered by <a className='mky-signature-link' target='_blank' href='http://criptext.com/'>Criptext</a></div>
				</div>
			)
		}
		return (
	    	<div className='mky-content-conversation'>
				<header id='mky-conversation-selected-header'>
					<div id='mky-conversation-selected-image'><img src={this.props.conversationSelected.urlAvatar}/></div>
					<div id='mky-conversation-selected-description'>
						<span id='mky-conversation-selected-name'>{this.props.conversationSelected.name}</span>
						<span id='mky-conversation-selected-status'></span>
					</div>
				</header>
				<TimelineChat conversationSelected={this.props.conversationSelected} imageSelected={this.handleImageSelected}/>
				{
					this.state.image_data ? (
						<ContentViewer imageSelected={this.state.image_data}/>
					):null
				}
				<Input enableGeoInput={this.enableGeoInput.bind(this)} messageCreated={this.props.messageCreated}/>
				<div className='mky-signature'>Powered by <a className='mky-signature-link' target='_blank' href='http://criptext.com/'>Criptext</a></div>
			</div>
		)
	}

	handleImageSelected(image){
		console.log('handleImageSelected');
		console.log(image);
		this.setState({image_data:image});
	}
}

export default ContentConversation;