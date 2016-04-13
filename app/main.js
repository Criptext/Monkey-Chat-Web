import React, { Component } from 'react'
import {render} from 'react-dom';
import ContentAside from './ContentAside.js';
import ContentWindow from './ContentWindow.js';

require('jquery-knob/dist/jquery.knob.min.js');
var $ = require('jquery');
window.jQuery = $;
window.$ = $;

class MonkeyUI extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversations: {
				'idlk0p519nvfmfgfzdbfn7b9': {
					id: 'idlk0p519nvfmfgfzdbfn7b9',
					lastMessage: undefined,
					members: undefined,
					name: 'Alberto',
					unreadMessageCount: 0,
					urlAvatar: 'https://secure.criptext.com/avatars/avatar_707.png',
					messages: {
						'1': {
							id: '1',
							senderId: 'if9ynf7looscygpvakhxs9k9',
							timestamp: 2,
							text: 'mensaje 1',
							recipientId: 'idlk0p519nvfmfgfzdbfn7b9',
							status: 0,
							type: 2,
							data: 'http://www.mejoresjugosparabajardepeso.com/wp-content/uploads/2015/08/manzana-verde-3-300x198.jpg',
						},
						'2': {
							id: '2',
							senderId: 'idlk0p519nvfmfgfzdbfn7b9',
							timestamp: 2,
							text: 'mensaje 2',
							recipientId: 'if9ynf7looscygpvakhxs9k9',
							status: 50,
							type: 1,
						}
					}
				},
				'ife4c0qdb0dopbg538lg14i': {
					id: 'ife4c0qdb0dopbg538lg14i',
					lastMessage: undefined,
					members: undefined,
					name: 'Luis Loaiza',
					unreadMessageCount: 0,
					urlAvatar: 'https://secure.criptext.com/avatars/avatar_62.png',
					messages: {
						'1': {
							id: '1',
							senderId: 'if9ynf7looscygpvakhxs9k9',
							timestamp: 2,
							recipientId: 'ife4c0qdb0dopbg538lg14i',
							status: 50,
							type: 3,
							data: 'http://www.publishers.org.uk/_resources/assets/attachment/full/0/2091.pdf',
							filename: 'An example paper',
							filesize: 194007,
						},
						'2': {
							id: '1460400827385',
							senderId: 'ife4c0qdb0dopbg538lg14i',
							timestamp: 2,
							recipientId: 'if9ynf7looscygpvakhxs9k9',
							status: 52,
							type: 4,
							data: 'http://www.stephaniequinn.com/Music/Canon.mp3',
							duration: 10,
						},
						'3':{
							id: '3',
							senderId: 'if9ynf7looscygpvakhxs9k9',
							timestamp: 2,
							recipientId: 'ife4c0qdb0dopbg538lg14i',
							status: 52,
							type: 4,
							data: 'http://www.stephaniequinn.com/Music/Mozart%20-%20Presto.mp3',
							duration: 10,
						}
					}
				}
				
			},
			conversation: undefined,
			userSession: { id:'if9ynf7looscygpvakhxs9k9', name:'Eri', urlAvatar:'https://secure.criptext.com/avatars/avatar_2275.png'}
		}
		this.handleConversationSelected = this.handleConversationSelected.bind(this);
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
	}
	
	render() {
		setTimeout(() =>{
			console.log('change world');
		}, 1000)
		var className = 'mky-wrapper-out '+this.props.prefix+this.props.screenMode;
    	return (
			<div className={className}>
				<div className="mky-wrapper-in">
					<div id="mky-content-connection" className="mky-disappear">
						<div className="mky-spinner">
							<div className="mky-bounce1"></div>
							<div className="mky-bounce2"></div>
							<div className="mky-bounce3"></div>
						</div>
					</div>
					<div id="mky-content-app" className="">
						<ContentAside conversations={this.state.conversations} conversationSelected={this.handleConversationSelected} userSession={this.state.userSession}/>
						<ContentWindow conversationSelected={this.state.conversation} userSessionId={this.state.userSession.id} messageToSet={this.handleMessageToSet}/>
					</div>
				</div>
			</div>
		)
	}
	
	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
	}
	
	handleConversationSelected(conversation) {	
		this.setState({conversation: conversation})
	}
	
	handleMessageToSet(message){
		message.id = Object.keys(this.state.conversations[this.state.conversation.id].messages).length + 1;
		message.senderId = this.state.userSession.id;
		message.recipientId = this.state.conversation.id;
		message.timestamp = 1;
		message.status = 52;
		
		let conversations = this.state.conversations;
		conversations[this.state.conversation.id].messages[message.id] = message;
		
		this.setState({conversations: conversations});
		
		console.log(message);
	}
	
	updateMessage(){
		
	}
}

MonkeyUI.propTypes = {
	showConversationList: React.PropTypes.bool,
	screenType: React.PropTypes.string
}

MonkeyUI.defaultProps = {
	prefix: 'mky-',
	showConversationList: true,
	screenType: 'fullscreen',
	screenMode: 'fullsize'
}

render(<MonkeyUI/>, document.getElementsByTagName('body')[0]);