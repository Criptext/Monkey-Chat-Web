import React, { Component } from 'react'
import {render} from 'react-dom';
import MonkeyUI from './MonkeyUI.js';

class App extends React.Component {
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
			userSession: { id:'if9ynf7looscygpvakhxs9k9', name:'Eri', urlAvatar:'https://secure.criptext.com/avatars/avatar_2275.png'}
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
/*
		this.view = {
			type: 'fullscreen'
		}
*/
		this.view = {
			type: 'classic',
			data: {
            	width: '380px',
				height: '500px'
        	}
		}
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.state.userSession} conversations={this.state.conversations} conversation={this.state.conversations['ife4c0qdb0dopbg538lg14i']} messageToSet={this.handleMessageToSet} />
		)
	}
	
	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
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

render(<App/>, document.getElementsByTagName('body')[0]);