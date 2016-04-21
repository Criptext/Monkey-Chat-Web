import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import MonkeyUI from './components/MonkeyUI.js';
import monkey from './src/monkey.js'

import {createStore} from 'redux';
import messages from './reducers';

const store = createStore(messages);

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversations: undefined,
			conversation: undefined,
			userSession: undefined,
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.view = {
			type: 'fullscreen'
		}
/*
		this.view = {
			type: 'classic',
			data: {
            	width: '380px',
				height: '500px'
        	}
		}
*/
		this.conversation;
	}
	
	componentWillMount() {
		this.setState({userSession: this.props.userSession});
		this.setState({conversations: this.props.conversations});
		let conversation = this.props.conversations['ife4c0qdb0dopbg538lg14i'];
		this.setState({conversation: conversation});
		var MONKEY_DEBUG_MODE = false;
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.state.userSession} conversations={this.state.conversations} conversation={this.state.conversation} messageToSet={this.handleMessageToSet} />
		)
	}
	
	handleConversationAdd(conversation) {
	  	this.setState({conversations: this.state.conversations.concat(conversation)})
	}
	
	handleMessageToSet(message) {
		
		message.id = Object.keys(this.state.conversations[message.recipientId].messages).length + 1;
		let conversations = this.state.conversations;
		conversations[this.state.conversation.id].messages[message.id] = message;
		//this.setState({conversations: conversations});
		console.log(message);

		store.dispatch({
			type: 'SAVE_MESSAGE',
			conversations: conversations
		});

	}
	
	updateMessage() {
		
	}
}
var userSession = { id:'if9ynf7looscygpvakhxs9k9', name:'Eri', urlAvatar:'https://secure.criptext.com/avatars/avatar_2275.png'};

function render() {
	ReactDOM.render(<App userSession={userSession} conversations={store.getState()}/>, document.getElementsByTagName('body')[0]);
	//ReactDOM.render(<App conversations={store.getState()}/>, document.getElementsByTagName('body')[0]);
}

render();
store.subscribe(render);