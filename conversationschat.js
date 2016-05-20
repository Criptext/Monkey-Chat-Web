import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from './components/MonkeyUI.js'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './utils/monkey-utils.js'
import * as vars from './utils/monkey-const.js'

import { createStore } from 'redux'
import reducer from './reducers'
import * as actions from './actions'

import MyForm from './components/MyForm.js'

const monkey = new Monkey ();
const store = createStore(reducer, { conversations: {}, users: { userSession:monkey.getUser() } });
var conversationSelectedId = 0;

class MonkeyChat extends Component {
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
		this.handleGetUserName = this.handleGetUserName.bind(this);
		this.handleUserSessionLogout = this.handleUserSessionLogout.bind(this);
		this.handleDeleteConversation = this.handleDeleteConversation.bind(this);
	}
	
	componentWillReceiveProps(nextProps) {
	}
	
	componentWillMount() {
		if(monkey.getUser() != null){
			var user = monkey.getUser();
			monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, false, vars.MONKEY_DEBUG_MODE, false);
		}
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} deleteConversation={this.handleDeleteConversation} userSession={this.props.store.users.userSession} conversations={this.props.store.conversations} userSessionLogout={this.handleUserSessionLogout} userSessionToSet={this.handleUserSessionToSet} messageToSet={this.handleMessageToSet} conversationOpened={this.handleConversationOpened} loadMessages={this.handleLoadMessages} form={MyForm} onClickMessage={this.handleOnClickMessage} dataDownloadRequest={this.handleDownloadData} getUserName={this.handleGetUserName}/>
		)
	}
	
	handleUserSessionToSet(user) {
		user.monkeyId = 'ife4c0qdb0dopbg538lg14i';
		user.urlAvatar = 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png';
		monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, false, vars.MONKEY_DEBUG_MODE, false);
	}

	handleUserSessionLogout() {	
		monkey.logout();
		store.dispatch(actions.deleteUserSession());
		store.dispatch(actions.removeConversations());
	}
	
	handleMessageToSet(message) {
		prepareMessage(message);
	}

	handleDeleteConversation(conversation) {
		store.dispatch(actions.deleteConversation(conversation));
	}
	
	handleConversationOpened(conversation) {
		monkey.sendOpenToUser(conversation.id);
		if(store.getState().conversations[conversation.id] && conversation.id != conversationSelectedId && store.getState().conversations[conversation.id].unreadMessageCounter != 0){
			store.dispatch(actions.updateConversationUnreadCounter(conversation, 0));
		}
		conversationSelectedId = conversation.id;
	}
	
	handleLoadMessages(conversationId, firstMessageId) {	
		monkey.getConversationMessages(conversationId, 10, firstMessageId, function(err, res){
			if(err){
	            console.log(err);
	        }else if(res){
		        if(res.length){
			     	let messages = {};
					res.map( mokMessage => {
						let message = defineBubbleMessage(mokMessage);
						if(message){
							messages[message.id] = message;	
						}
					});
					if(conversationSelectedId != conversationId){
						store.dispatch(actions.addMessages(messages, conversationId, true));
					}else{
						store.dispatch(actions.addMessages(messages, conversationId, false));
					}   
		        }
			}
		});
	}
	
	handleOnClickMessage(mokMessage) {

	}

	handleDownloadData(mokMessage){
		toDownloadMessageData(mokMessage);
	}
	
	handleGetUserName(userId){
		return store.getState().users[userId].name;
	}
	
/*
	conversationToSet() {
		let newConversation = dataConversation;
		store.dispatch(actions.addConversation(newConversation));
	}
*/
}

function render() {
	ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementById('my-chat'));
}

render();
store.subscribe(render);

// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('onConnect', function(event){
	let user = event;
	if(!store.getState().users.userSession){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}else if(!store.getState().users.userSession.id){
		user.id = event.monkeyId;
		user.urlAvatar = 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png';
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
	console.log('App - onMessage');
	defineMessage(mokMessage);
});

// ------------- ON NOTIFICATION --------------- //
monkey.on('onNotification', function(mokMessage){

	console.log('App - onNotification');
	let notType = mokMessage.protocolCommand;
	let conversationId = mokMessage.senderId;
	switch (notType){
		case 200:{ // message
			var proType = mokMessage.protocolType;
			if(proType == 3){ // Temporal Notificatio
				// HOW USE DATA BY PARAMS
				let typeTmpNotif = mokMessage.params.type;
                if (typeTmpNotif == 20 || typeTmpNotif == 21) { // typing state
                    let conversation = {
			            id: conversationId,
			            typing: typeTmpNotif
		            }
// 		            store.dispatch(actions.updateConversationTyping(conversation));
                }
			}
		}
            break;
        case 203:{ // open arrived

        }
            break;
        case 207:{ // open arrived
        	let message = {
				id: mokMessage.id,
			}
        	if(mokMessage.protocolType == 207){
				store.dispatch(actions.deleteMessage(message, mokMessage.recipientId));
				return;
			}
        }
            break;
        default:
            break;
	}
});

// -------------- ON ACKNOWLEDGE --------------- //
monkey.on('onAcknowledge', function(mokMessage){
	
	let ackType = mokMessage.protocolType;
	let conversationId = mokMessage.senderId;
	switch (ackType){
        case 1:{ // text
            let message = {
				id: mokMessage.id,
				oldId: mokMessage.oldId,
// 				status: Number(mokMessage.props.status),
				status: 50,
				recipientId: mokMessage.recipientId
			}
			store.dispatch(actions.updateMessageStatus(message, conversationId));
        }
		break;
        case 2:{ // media
            let message = {
				id: mokMessage.id,
				oldId: mokMessage.oldId,
// 				status: Number(mokMessage.props.status),
				status: 50,
				recipientId: mokMessage.recipientId
			}
			store.dispatch(actions.updateMessageStatus(message, conversationId));
        }
        break;
        case 203:{ // open conversation
	        if(!store.getState().conversations[conversationId])
	        	return;
	        
            let conversation = {
	            id: conversationId,
	            lastOpenMe: Number(mokMessage.props.last_open_me)*1000,
	            lastOpenApp: Number(mokMessage.props.last_seen)*1000,
	            online: Number(mokMessage.props.online)
            }
            store.dispatch(actions.updateConversationStatus(conversation));
            //monkeyUI.updateStatusMessageBubbleByTime(_conversationId,_lastOpenMe);

        }
        break;
        default:
            break;
    }
});

// MonkeyChat

function getConversations() {
	monkey.getAllConversations(function(err, res){
        if(err){
            console.log(err);
        }else if(res){
	        let conversations = {};
	        let users = {};
	        let usersToGetInfo = {};
	        res.data.conversations.map (conversation => {
		        if(!Object.keys(conversation.info).length)
		        	return;
		        
		        // define message	
		        let messages = {};
		        let messageId = null;
		        if (conversation.last_message.protocolType != 207){
		        	let message = defineBubbleMessage(conversation.last_message);
		        	messages[message.id] = message;
		        	messageId = message.id;
		        }
		        
		        // define conversation
		        let conversationTmp = {
			    	id: conversation.id,
			    	name: conversation.info.name == undefined ? 'Unknown' : conversation.info.name,
			    	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
			    	messages: messages,
			    	lastMessage: messageId,
			    	unreadMessageCounter: 0
		    	}
		    	
		    	// define group conversation
		        if(isConversationGroup(conversation.id)){
			        conversationTmp.members = undefined;
			        conversationTmp.description = '';
			        // add users into usersToGetInfo
			        conversation.members.map( id => {
				        if(!users[id]){
					        usersToGetInfo[id] = id;
				        }
			        });
		        }else{ // define personal conversation 
			        conversationTmp.lastOpenMe = undefined,
			    	conversationTmp.lastOpenApp = undefined,
			    	conversationTmp.online = undefined
			    	// add user into users
			    	let userTmp = {
				    	id: conversation.id,
				    	name: conversation.info.name == undefined ? 'Unknown' : conversation.info.name,
			    	}
			    	users[userTmp.id] = userTmp;
			    	// delete user from usersToGetInfo
			    	delete usersToGetInfo[userTmp.id];
		        }
		        conversations[conversationTmp.id] = conversationTmp;
	        })
	        
	        if(Object.keys(usersToGetInfo).length){
		        // define usersToGetInfo to array
		        let ids = [];
		        Object.keys(usersToGetInfo).map(id => {
			        ids.push(id);
		        })
		        
		        // get user info
		        monkey.getInfoByIds(ids, function(err, res){
			        if(err){
			            console.log(err);
			        }else if(res){
				        if(res.length){
					        let userTmp;
					        // add user into users
					        res.map(user => {
						    	userTmp = {
							    	id: user.monkey_id,
							    	name: user.name == undefined ? 'Unknown' : user.name,
							    }
							    users[userTmp.id] = userTmp;
					        });
				        }
			        }
			        if(Object.keys(users).length){
				        store.dispatch(actions.addUsersContact(users));
			        }
			        store.dispatch(actions.addConversations(conversations));
			        monkey.getPendingMessages();
		        });
	        }else{
		        if(Object.keys(users).length){
			        store.dispatch(actions.addUsersContact(users));
		        }
		        store.dispatch(actions.addConversations(conversations));
		        monkey.getPendingMessages();
	        }
        }
    });
}

function prepareMessage(message) {
	switch (message.bubbleType){
		case 'text': { // bubble text
			let mokMessage = monkey.sendEncryptedMessage(message.text, message.recipientId, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'image': { // bubble image
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'file': { // bubble file
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'audio': { // bubble audio
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: message.length}, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
	}
}

function defineMessage(mokMessage) {
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;

	if(!store.getState().conversations[conversationId]){ // handle does not exits conversations
		toDefineConversation(conversationId, mokMessage);
		return;
	}
	let message = defineBubbleMessage(mokMessage);

	if(message){
		if(conversationSelectedId != conversationId){
			store.dispatch(actions.addMessage(message, conversationId, true));
		}else{
			store.dispatch(actions.addMessage(message, conversationId, false));
		}
	}
}

function defineBubbleMessage(mokMessage){
	let message = {
    	id: mokMessage.id.toString(),
    	oldId: mokMessage.oldId,
    	datetimeCreation: mokMessage.datetimeCreation*1000,
		datetimeOrder: mokMessage.datetimeOrder,
		recipientId: mokMessage.recipientId,
		senderId: mokMessage.senderId,
		status: 50,
		mokMessage: mokMessage,
		isDownloading: false
    }
    
    switch (mokMessage.protocolType){
    	case 1:{
	    	message.bubbleType = 'text';
	    	message.text = mokMessage.text;
		    message.preview = mokMessage.text;
    	}
    		break;
    	case 2:{
	    	message.filename = mokMessage.props.filename;
			message.mimetype = mokMessage.props.mime_type;
			
	    	if(mokMessage.props.file_type == 1){
		    	message.bubbleType = 'audio';
		    	message.preview = 'Audio';
		    	message.length = mokMessage.params ? mokMessage.params.length : 1;
	    	}else if(mokMessage.props.file_type == 3){
		    	message.bubbleType = 'image';
		    	message.preview = 'Image';
	    	}else if(mokMessage.props.file_type == 4){
		    	message.bubbleType = 'file';
		    	message.preview = 'File';
		    	message.filesize = mokMessage.props.size;
	    	}
    	}
    		break;
		case 207:{
			return "";
		}
			break;
    	default:
    		break;
    }
    return message;
}

function toDefineConversation(conversationId, mokMessage){

	if(store.getState().users[conversationId]==null){
		monkey.getInfoById(conversationId, function(err, resp){
			if(err){
	            console.log(err);
	        }else if(resp){
				if(isConversationGroup(conversationId)){
					store.dispatch(actions.addConversation(defineConversation(mokMessage, resp.info.name, resp.members_info, resp.members)));
				}else{
					store.dispatch(actions.addConversation(defineConversation(mokMessage, resp.name)));
				}
			}		
		});
	}else{
		store.dispatch(actions.addConversation(defineConversation(mokMessage, store.getState().users[mokMessage.senderId].name)));
	}
}

function defineConversation(mokMessage, name, members_info, members){
	let message = defineBubbleMessage(mokMessage);
	
	// define conversation
	let conversation = {
    	name: name,
    	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
    	messages: {
    		[message.id]: message
    	},
    	lastMessage: message.id,
    	unreadMessageCounter: 1,
	}
	
	// define group conversation
	if(members_info){
		conversation.id = mokMessage.recipientId;
		conversation.description = '';
		conversation.members = members;
		
		// get user info
		let users = {};
		let userTmp;
		members_info.map(user => {
			userTmp = {
		    	id: user.monkey_id,
		    	name: user.name == undefined ? 'Unknown' : user.name,
		    }
		    users[userTmp.id] = userTmp;
		});
		store.dispatch(actions.addUsersContact(users));
	}else{ // define personal conversation
		conversation.id = mokMessage.senderId;
		conversation.lastOpenMe = undefined;
    	conversation.lastOpenApp = undefined;
    	conversation.onlineStatus = undefined;
	}
	
	return conversation;
}

function toDownloadMessageData(mokMessage){
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;

	switch(parseInt(mokMessage.props.file_type)){
			
	case 1: // audio
		monkey.downloadFile(mokMessage, function(err, data){
			console.log('App - audio downloaded');
			let src = 'data:audio/mpeg;base64,'+data;
			let message = {
				id: mokMessage.id,
				data: src
			}
			store.dispatch(actions.updateMessageData(message, conversationId));
		});
		break;
	case 3: // image
		monkey.downloadFile(mokMessage, function(err, data){
			console.log('App - image downloaded');
			let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
			let message = {
				id: mokMessage.id,
				data: src
			}
			store.dispatch(actions.updateMessageData(message, conversationId));
		});
		break;
	case 4: // file
		monkey.downloadFile(mokMessage, function(err, data){
			console.log('App - file downloaded');
			let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
			let message = {
				id: mokMessage.id,
				data: src
			}
			store.dispatch(actions.updateMessageData(message, conversationId));
		});
		break;
	}
}

function listMembers(members){
	var list = [];
		this.props.conversationSelected.members.map(function(member) {
			list.push(member.name);
        })
	return list.join(', ');
}
	
//ENDFILE