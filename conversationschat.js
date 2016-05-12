import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './utils/monkey-utils.js'
import * as vars from './utils/monkey-const.js'

import { createStore } from 'redux'
import reducer from './reducers'
import initData from './utils/data'

import * as actions from './actions'
import dataConversation from './utils/dataNewConversation'

const monkey = new Monkey ();
const store = createStore(reducer, { conversations: {}, users: { userSession:monkey.getUser() } });

class MonkeyChat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: {}
		}
		this.view = {
			type: 'fullscreen'
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
	}
	
	componentWillMount() {
		if(monkey.getUser() != null){
			var user = monkey.getUser();
			monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, false, vars.MONKEY_DEBUG_MODE, false);
		}
	}
	
	componentWillReceiveProps(nextProps) {
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.props.store.users.userSession} conversations={this.props.store.conversations} userSessionToSet={this.handleUserSessionToSet} messageToSet={this.handleMessageToSet} conversationOpened={this.handleConversationOpened} loadMessages={this.handleLoadMessages}/>
		)
	}
	
	handleUserSessionToSet(user) {
		user.monkeyId = 'if9ynf7looscygpvakhxs9k9';
		user.urlAvatar = 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png';
		monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, false, vars.MONKEY_DEBUG_MODE, false);
	}
	
	handleMessageToSet(message) {
		prepareMessage(message);
	}
	
	handleConversationOpened(conversation) {
		console.log('hi conversation');
		monkey.sendOpenToUser(conversation.id);
	}
	
	handleLoadMessages(conversation) {
		console.log('load more messages from conversation');
		monkey.getConversationMessages(conversation.id, 10, conversation.messages[0], function(){
			console.log('hello its me from the get conversations ' + conversation.messages);
		});
	}
/*
	conversationToSet() {
		let newConversation = dataConversation;
		store.dispatch(actions.addConversation(newConversation));
	}
*/
}

function render() {
	ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementsByTagName('body')[0]);
}

render();
store.subscribe(render);

// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('onConnect', function(event){
	let user = event;
	if(!Object.keys(store.getState().users).length){
		console.log('App - onConnect');
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		getConversations();
	}
});

// -------------- ON DISCONNECT --------------- //
monkey.on('onDisconnect', function(event){
	console.log('App - onDisconnect');
});

// --------------- ON MESSAGE ----------------- //
monkey.on('onMessage', function(mokMessage){
	console.log('onMessage');
	defineMessage(mokMessage);
});

// ------------- ON NOTIFICATION --------------- //
monkey.on('onNotification', function(mokMessage){
// 	console.log('onNotification');
// 	console.log(mokMessage);
});

// -------------- ON ACKNOWLEDGE --------------- //
monkey.on('onAcknowledge', function(mokMessage){
	console.log('onAcknowledge');
	console.log(mokMessage);
	
	let ackType = mokMessage.protocolType;
	let conversationId = mokMessage.senderId;
	switch (ackType){
        case 1:{ // text
            console.log('text message received by the user');
            
            let message = {
				id: mokMessage.id,
				oldId: mokMessage.oldId,
				status: Number(mokMessage.props.status),
				recipientId: mokMessage.recipientId
			}
			store.dispatch(actions.updateMessageStatus(message, conversationId));
        }
		break;
        case 2:{ // media
            console.log('file message received by the user');

            let message = {
				id: mokMessage.id,
				oldId: mokMessage.oldId,
				status: Number(mokMessage.props.status),
				recipientId: mokMessage.recipientId
			}
			store.dispatch(actions.updateMessageStatus(message, conversationId));
        }
        break;
        case 203:{ // open conversation
            console.log('open conversation received by the user');
            let conversation = {
	            id: conversationId,
	            lastOpenMe: Number(mokMessage.props.last_open_me)*1000,
	            lastOpenApp: Number(mokMessage.props.last_seen)*1000,
	            online: Number(mokMessage.props.online)
            }
            store.dispatch(actions.updateConversationStatus(conversation));
//             _conversation.setLastOpenMe(_lastOpenMe);
            //monkeyUI.updateStatusMessageBubbleByTime(_conversationId,_lastOpenMe);
//             monkeyUI.updateOnlineStatus(_lastOpenApp,_online);
        }
        break;
        default:
            break;
    }
});

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
			    	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
			    	messages: {
			    		[conversation.last_message.id]: {
				    		id: conversation.last_message.id,
					    	datetimeCreation: conversation.last_message.datetimeCreation,
					    	datetimeOrder: conversation.last_message.datetimeOrder,
					    	recipientId: conversation.last_message.rid,
					    	senderId: conversation.last_message.sid,
					    	text: conversation.last_message.text,
					    	preview: conversation.last_message.text,
					    	bubbleType: 'text',
					    	status: 50
			    		}
			    	},
			    	lastMessage: conversation.last_message.id
		    	}
		    	
		        if(isConversationGroup(conversation.id)){
			        conversationTmp.members = conversation.members;
		        }else{
			        conversationTmp.lastOpenMe = undefined,
			    	conversationTmp.lastOpenApp = undefined,
			    	conversationTmp.online = undefined
		        }
		        conversations[conversationTmp.id] = conversationTmp;
	        })
	        store.dispatch(actions.addConversations(conversations));
	        monkey.getPendingMessages();
        }
    });
}

function prepareMessage(message) {
	switch (message.bubbleType){
		case 'text': { // bubble text
			let mokMessage = monkey.sendEncryptedMessage(message.text, message.recipientId, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'image': { // bubble image
/*
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, false, null, null, function(err, mokMessage){
				if (err){
					console.log(err);
				}else{
					let message = {
						id: mokMessage.id,
						oldId: mokMessage.oldId,
						status: 51,
						recipientId: mokMessage.recipientId
					}
					console.log('image acepted');
// 					store.dispatch(actions.updateMessageStatus(message, message.recipientId));
				}
			});
*/
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'file': { // bubble file
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'audio': { // bubble audio
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
	}
}

function defineMessage(mokMessage) {
	console.log(mokMessage);
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;
	let message = {
		id: mokMessage.id,
		oldId: mokMessage.oldId,
    	datetimeCreation: mokMessage.datetimeCreation,
    	datetimeOrder: mokMessage.datetimeOrder,
    	recipientId: mokMessage.recipientId,
    	senderId: mokMessage.senderId,
    	status: 50
	}
	switch (mokMessage.protocolType){
		case 1:{
			message.bubbleType = 'text';
			message.text = mokMessage.text;
			message.preview = mokMessage.text;
			break;
		}
		case 2:{
			message.filename = mokMessage.props.filename;
			message.mimetype = mokMessage.props.mime_type;
			if(mokMessage.props.file_type == 1){ // audio
				message.bubbleType = 'audio';
				message.preview = 'Audio';
				
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('audio downloaded');
					console.log(data);
					let src = 'data:audio/mpeg;base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log(mokMessage.id);
					console.log(mokMessage.oldId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
				
			}else if(mokMessage.props.file_type == 3){ // image
				message.bubbleType = 'image';
				message.preview = 'Image';
				
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('image downloaded');
					console.log(data);
					let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log(mokMessage.id);
					console.log(mokMessage.oldId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
			}else if(mokMessage.props.file_type == 4){ // file
				message.bubbleType = 'file';
				message.preview = 'File';
				message.filesize = mokMessage.props.size;
				
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('file downloaded');
					console.log(data);
					let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log(mokMessage.id);
					console.log(mokMessage.oldId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
			}
			break;
		}
	}
	store.dispatch(actions.addMessage(message, conversationId));
}