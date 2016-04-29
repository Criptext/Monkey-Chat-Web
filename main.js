import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import monkey from './src/monkey.js'

import { createStore } from 'redux'
import reducer from './reducers'
import initData from './utils/data'
const store = createStore(reducer, { conversations: initData, users: {} });

import * as actions from './actions'

import dataConversation from './utils/dataNewConversation'

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversations: this.props.store.conversations,
			conversation: undefined,
			userSession: this.props.store.userSession,
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
		this.conversationToSet = this.conversationToSet.bind(this);
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

	}
	
	componentWillMount() {
		//this.setState({userSession: this.props.userSession});
		//this.setState({conversations: this.props.conversations});
/*
		let conversation = this.props.conversations['ife4c0qdb0dopbg538lg14i'];
		this.setState({conversation: conversation});
*/
		var MONKEY_DEBUG_MODE = false;
	}
	
	componentWillReceiveProps(nextProps) {
		this.setState({conversations: nextProps.store.conversations});
	}
	
	render() {
		return (
// 			<MonkeyUI view={this.view} userSession={this.state.userSession} conversations={this.state.conversations} conversation={this.state.conversation} messageToSet={this.handleMessageToSet} userSessionToSet={this.handleUserSessionToSet}/>
			<MonkeyUI view={this.view} userSession={this.state.userSession} conversations={this.state.conversations} messageToSet={this.handleMessageToSet} userSessionToSet={this.handleUserSessionToSet}/>
		)
	}
	
	handleMessageToSet(message) {
		// replace message.id with oldMessageId, when use monkey
		message.id = Object.keys(this.state.conversations[message.recipientId].messages).length + 1;
		store.dispatch(actions.addMessage(message));
		//this.conversationToSet();
	}
	
	handleUserSessionToSet(user) {
		user.id = 'if9ynf7looscygpvakhxs9k9';
		user.urlAvatar = 'https://secure.criptext.com/avatars/avatar_2275.png';
		this.setState({userSession: user});
	}
	
	conversationToSet() {
		let newConversation = dataConversation;
		store.dispatch(actions.addConversation(newConversation));
	}
}

function render() {
	ReactDOM.render(<App store={store.getState()}/>, document.getElementsByTagName('body')[0]);
}

render();
store.subscribe(render);