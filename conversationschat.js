import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './utils/monkey-utils.js'
import * as vars from './utils/monkey-const.js'

import { createStore } from 'redux'
import reducer from './reducers'
import initData from './utils/data'
const store = createStore(reducer, { conversations: {}, users: {} });

import * as actions from './actions'
import dataConversation from './utils/dataNewConversation'

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
			<MonkeyUI view={this.view} userSession={this.props.store.users.userSession} conversations={this.props.store.conversations} messageToSet={this.handleMessageToSet}userSessionToSet={this.handleUserSessionToSet}/>
		)
	}
	
	handleMessageToSet(message) {
		// replace message.id with oldMessageId, when use monkey
		message.id = Object.keys(this.props.store.conversations[message.recipientId].messages).length + 1;
		store.dispatch(actions.addMessage(message));
	}
	
	handleUserSessionToSet(user) {
		user.monkeyId = 'if9ynf7looscygpvakhxs9k9';
		user.urlAvatar = 'https://secure.criptext.com/avatars/avatar_2275.png';
		monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, true, vars.MONKEY_DEBUG_MODE);
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
	store.dispatch(actions.addUserSession(user));
	getConversations();
})

function getConversations() {
	monkey.getAllConversations(function(err, res){
        if(err){
            console.log(err);
        }else if(res){
	        let conversations = {};
	        res.data.conversations.map (conversation => {
		        if(!Object.keys(conversation.info).length)
		        	return;
		        	
		        let conversationTmp = {
			    	id: conversation.id,
			    	name: conversation.info.name,
			    	messages: {
			    		[conversation.last_message.id]: {
				    		id: conversation.last_message.id,
					    	datetime: conversation.last_message.datetime,
					    	recipientId: conversation.last_message.rid,
					    	senderId: conversation.last_message.sid,
					    	text: conversation.last_message.msg,
					    	type: 1
			    		}
			    	},
			    	lastMessage: conversation.last_message.id
		    	}
		    	
		        if(isConversationGroup(conversation.id)){
			        conversationTmp.members = conversation.members;
		        }
		        conversations[conversationTmp.id] = conversationTmp;
	        })
	        store.dispatch(actions.addConversations(conversations));
        }
    });
}