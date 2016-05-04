import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkeykit'

import { createStore } from 'redux'
import reducer from './reducers'
const store = createStore(reducer, { conversations: {}, users: {} });

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
			type: 'classic',
			data: {
            	width: '380px',
				height: '500px'
        	}
		}
	}
	
	componentWillMount() {
		//this.setState({userSession: this.props.userSession});
		//this.setState({conversations: this.props.conversations});
/*
		let conversation = this.props.conversations['ife4c0qdb0dopbg538lg14i'];
		this.setState({conversation: conversation});
*/		
	}
	
	componentWillReceiveProps(nextProps) {
		if(this.props.store.conversations){
			console.log('new add conversation!');
		}
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
	console.log(user);
	store.dispatch(actions.addUserSession(user));
	addConversation(user);
});

function addConversation(user) {
	let conversationId = 'G:252';
	if(isConversationGroup(conversationId)) { // group conversation
		monkey.getInfoById(conversationId, function(error, data){
	        if(data != undefined){
		        console.log(data);
		        var _members = data.members;
		        var _info = {avatar: '', name: myUser.name}
		        monkey.createGroup(_members, _info, null, null, function(error, data){ // create new group
			        if(data != undefined){
			        	console.log(data);
			        	
			        	let newConversation;
			        	newConversation.id = data.group_id;
			        	newConversation.name = data.group_info.name;
			        	newConversation.urlAvatar = 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png';
			        	newConversation.unreadMessageCount = 0;
			        	newConversation.members = data.members_info;
			        	console.log(newConversation);
			        	
			        	store.dispatch(actions.addConversation);
			        }else{
				        console.log(error);
			        }
		        });
	        }else{
		        console.log(error);
	        }
        });
	}
}

// Util

function isEmpty(object) {
  for(var key in object) {
    if(object.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}

function isConversationGroup(conversationId){
    var result = false;
    if(conversationId.indexOf("G:") >= 0){
        result = true;
    }
    return result;
}