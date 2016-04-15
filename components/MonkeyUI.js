import React, { Component } from 'react'
import {render} from 'react-dom';
import ContentAside from './ContentAside.js';
import ContentWindow from './ContentWindow.js';

class MonkeyUI extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined,
			style: undefined,
			idTabButton: 'mky-w-max'
		}
		this.openTab = this.openTab.bind(this);
		this.handleConversationSelected = this.handleConversationSelected.bind(this);
		this.handleMessageCreated = this.handleMessageCreated.bind(this);
		this.screen;
		this.showConversations = true;
		this.expandWindow = false;
	}
	
	componentWillMount() {
		let screenMode;
		if(this.props.view.type === 'fullscreen'){
			screenMode = 'fullsize';
		}else{
			screenMode = 'partialsize';
			let style = {
				width: this.props.view.data.width,
				height: '30px'
			}
			this.setState({style: style});
		}
		this.screen = this.props.prefix+screenMode+' '+this.props.prefix+this.props.view.type;
		
		this.setState({ conversation: this.props.conversation});
		if(this.props.view.type === 'classic'){
			this.showConversations = false;
			this.expandWindow = true;
		}
	}
	
	render() {
    	return (
			<div className={'mky-wrapper-out '+this.screen} style={this.state.style}>
				{ this.props.view.type === 'classic'
					? (
						<div className='mky-tab'>
                            <span className='mky-tablabel'> Want to know more? </span>
                            <div id={this.state.idTabButton} onClick={this.openTab}></div>
                        </div>
					)
					: null
				}
				<div className="mky-wrapper-in">
					<div id="mky-content-connection" className="mky-disappear">
						<div className="mky-spinner">
							<div className="mky-bounce1"></div>
							<div className="mky-bounce2"></div>
							<div className="mky-bounce3"></div>
						</div>
					</div>
					<div id="mky-content-app" className="">
						{ this.showConversations
							? <ContentAside conversations={this.props.conversations} conversationSelected={this.handleConversationSelected} userSession={this.props.userSession} show={this.showListConversation}/>
							: null
						}
						<ContentWindow conversationSelected={this.state.conversation} userSessionId={this.props.userSession.id} messageCreated={this.handleMessageCreated} expandWindow={this.expandWindow}/>
					</div>
				</div>
			</div>
		)
	}
	
	openTab(){
		if(this.state.idTabButton === 'mky-w-max'){
			this.setState({
				style: this.props.view.data,
				idTabButton: 'mky-w-min'
			});
		}else{
			let style = {
				width: this.props.view.data.width,
				height: '30px'
			}
			this.setState({
				style: style,
				idTabButton: 'mky-w-max'
			});
		}
	}
	
	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
	}
	
	handleConversationSelected(conversation) {	
		this.setState({conversation: conversation})
	}
	
	handleMessageCreated(message){	
		message.senderId = this.props.userSession.id;
		message.recipientId = this.state.conversation.id;
		message.timestamp = 1;
		message.status = 0;
		
		this.props.messageToSet(message);
	}
}

MonkeyUI.propTypes = {
	showConversationList: React.PropTypes.bool,
	screenType: React.PropTypes.string
}

MonkeyUI.defaultProps = {
	prefix: 'mky-',
	showConversationList: true,
	view:{
		type: 'fullscreen'
	}
}

export default MonkeyUI;