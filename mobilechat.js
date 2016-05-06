import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkey-sdk'

import { createStore } from 'redux'
import reducer from './reducers'
import initData from './utils/data'
const store = createStore(reducer, { conversations: initData, users: {} });

import * as actions from './actions'
import dataConversation from './utils/dataNewConversation'

var MONKEY_DEBUG_MODE = true;
var CRIPTEXT_AVATAR_URL = "https://secure.criptext.com/avatars/";
var monkey = new Monkey ();

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: {}
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
		this.conversationToSet = this.conversationToSet.bind(this);
		this.view = {
			type: 'fullscreen'
		}
	}
	
	componentWillReceiveProps(nextProps) {
// 		this.setState({conversations: nextProps.store.conversations});
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.props.store.users.userSession} conversations={this.props.store.conversations} messageToSet={this.handleMessageToSet} userSessionToSet={this.handleUserSessionToSet} conversation={this.state.conversation}/>
		)
	}
	
	handleMessageToSet(message) {
		// replace message.id with oldMessageId, when use monkey
		message.id = Object.keys(this.props.store.conversations[message.recipientId].messages).length + 1;
		store.dispatch(actions.addMessage(message));
	}
	
	handleUserSessionToSet(user) {
		store.dispatch(actions.addUserSession(user));
		monkey.init("idkgwf6ghcmyfvvrxqiwwmi", "9da5bbc32210ed6501de82927056b8d2", user, true, MONKEY_DEBUG_MODE);
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

// MonkeyKit

monkey.addListener('onConnect', function(event){
	let user = event;
	user.id = event.monkeyId;
	store.dispatch(actions.addUserSession(user));
	addConversation();
})

function addConversation() {
	let conversation;
	let newConversation = {
		id: data.group_id,
		name: data.group_info.name,
		urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
		unreadMessageCount: 0,
		members: data.members_info,
		messages: {}
	};
	store.dispatch(actions.addConversation(newConversation));
}

// My chat

function initConversation(userConversation){
	let newConversation = {
		id: userConversation.monkey_id,
		name: userConversation.name,
		urlAvatar: CRIPTEXT_AVATAR_URL + userConversation.id + 'png'
	};
	store.dispatch(actions.addConversation(newConversation));
}