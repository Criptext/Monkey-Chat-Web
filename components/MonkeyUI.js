import React, { Component } from 'react'
import {render} from 'react-dom';
import ContentAside from './ContentAside.js';
import ContentWindow from './ContentWindow.js';
import ContentLogin from './ContentLogin.js';

import MyForm from './MyForm.js';
const Form_ = ContentLogin(MyForm);

import BubbleText from './BubbleText.js';
import BubbleImage from './BubbleImage.js';
import BubbleFile from './BubbleFile.js';
import BubbleAudio from './BubbleAudio.js';
import BubbleLocation from './BubbleLocation.js';

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

class MonkeyUI extends Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: {},
			tabStyle: undefined,
			classLoading: 'mky-disappear',
			idTabButton: 'mky-w-max',
			isMobile: isMobile.any() ? true : false,
			showConversations:true
		}
		this.openTab = this.openTab.bind(this);
		this.handleLoginSession = this.handleLoginSession.bind(this);
		this.handleConversationSelected = this.handleConversationSelected.bind(this);
		this.handleMessageCreated = this.handleMessageCreated.bind(this);
		this.classContent;
		// this.showConversations = true;
		this.expandWindow = false;
		this.handleShowAside = this.handleShowAside.bind(this);
	}

	getChildContext() {
	    return {
		    userSession: this.props.userSession,
		    text: BubbleText,
		    image: BubbleImage,
		    file: BubbleFile,
		    audio: BubbleAudio,
		    location: BubbleLocation,
		}
	}

	componentWillMount() {
		this.setState({conversation: this.props.conversation});

		let screenMode;
		if(this.props.view.type === 'fullscreen'){
			screenMode = 'fullsize';
		}else{
			screenMode = 'partialsize';
			let style = {
				width: this.props.view.data.width,
				height: this.props.tabHeight
			}
			this.setState({tabStyle: style});
		}
		this.classContent = this.props.prefix+screenMode+' '+this.props.prefix+this.props.view.type;

		if(this.props.view.type === 'classic'){
			// this.showConversations = false;
			this.setState({showConversations:false});
			this.expandWindow = true;
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.conversation){ // conversation selected sent by props
			this.setState({conversation: nextProps.conversation});
		}else if(this.state.conversation){
			this.setState({conversation: nextProps.conversations[this.state.conversation.id]});
		}
		this.setState({conversations: nextProps.conversations});
	}

	render() {
    	return (
			<div className={'mky-wrapper-out '+this.classContent} style={this.state.tabStyle}>

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
								{ this.state.showConversations
									? <ContentAside conversations={this.state.conversations} conversationSelected={this.handleConversationSelected} show={this.showListConversation}/>
									: null
								}

								<ContentWindow loadMessages={this.props.loadMessages} conversationSelected={this.state.conversation} messageCreated={this.handleMessageCreated} expandWindow={this.expandWindow} expandAside={this.handleShowAside} isMobile={this.state.isMobile}/>
							</div>
						)
						: <Form_ handleLoginSession={this.handleLoginSession} />
					}
				</div>
			</div>
		)
	}

	openTab() {
		if(this.state.idTabButton === 'mky-w-max'){
			this.setState({
				tabStyle: this.props.view.data,
				idTabButton: 'mky-w-min'
			});
		}else{
			let style = {
				width: this.props.view.data.width,
				height: this.props.tabHeight
			}
			this.setState({
				tabStyle: style,
				idTabButton: 'mky-w-max'
			});
		}
	}

	handleLoginSession(user) {
		this.props.userSessionToSet(user);
	}

	setLoading(value) {
		if(value){
			this.setState({classLoading: 'mky-appear'});
		}else{
			this.setState({classLoading: 'mky-disappear'});
		}
	}

	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
	}

	handleConversationSelected(conversation) {
		this.setState({conversation: conversation});
		this.props.conversationOpened(conversation);
		if (this.state.isMobile) {
			this.setState({showConversations:false}); //escondiendo el aside solo cuando esta en mobile
		}

	}

	handleShowAside(){
		if (this.state.isMobile) {
			this.setState({showConversations:true}); //mostrando el aside solo cuando esta en mobile
		}
	}

	handleMessageCreated(message){
		var timestamp = new Date().getTime();
		message.senderId = this.props.userSession.id;
		message.recipientId = this.state.conversation.id;
		message.status = 0;
		this.props.messageToSet(message);
	}
}

MonkeyUI.propTypes = {
	view: React.PropTypes.object
}

MonkeyUI.defaultProps = {
	prefix: 'mky-',
	view:{
		type: 'fullscreen'
	},
	tabHeight: '30px'
}

MonkeyUI.childContextTypes = {
	userSession: React.PropTypes.object,
	text: React.PropTypes.any,
    image: React.PropTypes.any,
    file: React.PropTypes.any,
    audio: React.PropTypes.any,
    location: React.PropTypes.any,
}

export default MonkeyUI;
