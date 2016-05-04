import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkeykit'

import { createStore } from 'redux'
import reducer from './reducers'
import initData from './utils/data'
const store = createStore(reducer, { conversations: initData, users: {} });

import * as actions from './actions'
import dataConversation from './utils/dataNewConversation'

var MONKEY_DEBUG_MODE = false;
var monkey = new Monkey ();

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
		this.conversationToSet = this.conversationToSet.bind(this);
		this.view = {
			type: 'fullscreen'
		}
	}
	
	componentWillMount() {

	}
	
	componentWillReceiveProps(nextProps) {

	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.props.store.users.userSession} conversations={this.props.store.conversations} messageToSet={this.handleMessageToSet} userSessionToSet={this.handleUserSessionToSet}/>
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
/*
		user.id = 'if9ynf7looscygpvakhxs9k9';
		user.urlAvatar = 'https://secure.criptext.com/avatars/avatar_2275.png';
		this.setState({userSession: user});
*/
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
	console.log(user);
	store.dispatch(actions.addUserSession(user));
	getConversations();
})

function getConversations() {
	monkey.getAllConversations(function(onComplete,err){
        if(err){
            console.log(err);
        }else if(onComplete){
	        console.log(onComplete);
//             loadConversations(onComplete.data.conversations);
        }
    });
}