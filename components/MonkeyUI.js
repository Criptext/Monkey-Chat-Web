import React, { Component } from 'react'
import {render} from 'react-dom';
import ContentAside from './ContentAside.js';
import ContentWindow from './ContentWindow.js';

import SessionForm from './SessionForm.js';
import MyForm from './MyForm.js';
const Form_ = SessionForm(MyForm);

class MonkeyUI extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined,
			style: undefined,
			classLoading: 'mky-disappear',
			idTabButton: 'mky-w-max'
		}
		this.openTab = this.openTab.bind(this);
		this.loginSession = this.loginSession.bind(this);
		
		this.handleConversationSelected = this.handleConversationSelected.bind(this);
		this.handleMessageCreated = this.handleMessageCreated.bind(this);
		this.defineTime = this.defineTime.bind(this);
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
				<div className='mky-wrapper-in'>
					{ this.props.userSession
						? (
							<div id='mky-content-app' className=''>
								<div id='mky-content-connection' className={this.state.classLoading}>
									<div className='mky-spinner'>
										<div className='mky-bounce1'></div>
										<div className='mky-bounce2'></div>
										<div className='mky-bounce3'></div>
									</div>
								</div>
								{ this.props.userSession
									? <ContentAside conversations={this.props.conversations} conversationSelected={this.handleConversationSelected} userSession={this.props.userSession} show={this.showListConversation}/>
									: null
								}
								<ContentWindow conversationSelected={this.state.conversation} userSessionId={this.props.userSession.id} messageCreated={this.handleMessageCreated} expandWindow={this.expandWindow}/>
							</div>
						)
						: (
							<Form_ loginSession={this.loginSession} />
						)
					}
				</div>
			</div>
		)
	}
	
	openTab() {
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
	
	loginSession() {
		
	}
	
	setLoading(value) {
		if(value){
			this.setStatus({classLoading: 'mky-appear'});
		}else{
			this.setStatus({classLoading: 'mky-disappear'});
		}
	}
	
	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
	}
	
	handleConversationSelected(conversation) {
		this.setState({conversation: conversation})
	}
	
	handleMessageCreated(message){	
		var timestamp = new Date().getTime();
		message.senderId = this.props.userSession.id;
		message.recipientId = this.state.conversation.id;
		message.timestamp = this.defineTime( timestamp);
		message.status = 0;
		
		this.props.messageToSet(message);
	}
	
	defineTime(time) {
	    var _d = new Date(+time);
	    var nhour = _d.getHours(),
	        nmin = _d.getMinutes(),
	        ap;
	    if (nhour == 0) {
	        ap = " AM";nhour = 12;
	    } else if (nhour < 12) {
	        ap = " AM";
	    } else if (nhour == 12) {
	        ap = " PM";
	    } else if (nhour > 12) {
	        ap = " PM";nhour -= 12;
	    }
	    return ("0" + nhour).slice(-2) + ":" + ("0" + nmin).slice(-2) + ap + "";
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