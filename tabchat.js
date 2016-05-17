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

var monkey = new Monkey ();
const store = createStore(reducer, { conversations: {}, users: { userSession:monkey.getUser() } });

class MonkeyChat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined
		}
		this.view = {
			type: 'classic',
			data: {
            	width: '380px',
				height: '500px'
        	}
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
	}
	
	componentWillReceiveProps(nextProps) {
		if(Object.keys(nextProps.store.conversations).length){ // handle conversation define by props
			this.setState({conversation: nextProps.store.conversations[Object.keys(nextProps.store.conversations)[0]]});
		}
	}
	
	componentWillMount() {
		if(monkey.getUser() != null){
			var user = monkey.getUser();
			monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, false, vars.MONKEY_DEBUG_MODE, false);
		}
	}
	
	render() {
		return (
			<MonkeyUI view={this.view} userSession={this.props.store.users.userSession} conversation={this.state.conversation} conversations={this.props.store.conversations} userSessionToSet={this.handleUserSessionToSet} messageToSet={this.handleMessageToSet} loadMessages={this.handleLoadMessages} form={MyForm} onClickMessage={this.handleOnClickMessage}/>
		)
	}
	
	handleUserSessionToSet(user) {
		store.dispatch(actions.addUserSession(user));
		monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, true, vars.MONKEY_DEBUG_MODE);
	}
	
	handleMessageToSet(message) {
		prepareMessage(message);
	}
	
	handleLoadMessages(conversationId, firstMessageId) {	
		monkey.getConversationMessages(conversationId, 10, firstMessageId, function(err, res){
			if(err){
	            console.log(err);
	        }else if(res){
				res.map( message => {
					defineMessage(message);
				});
			}
		});
	}
	
	handleOnClickMessage(message) {
		
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
monkey.addListener('onConnect', function(event){
	let user = event;
	if(!store.getState().users.userSession){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}else if(!store.getState().users.userSession.id){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		addConversation(user);
	}
});

// --------------- ON MESSAGE ----------------- //
monkey.on('onMessage', function(mokMessage){
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
        	defineMessage(mokMessage);
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
				status: Number(mokMessage.props.status),
				recipientId: mokMessage.recipientId
			}
			store.dispatch(actions.updateMessageStatus(message, conversationId));
        }
		break;
        case 2:{ // media
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

function addConversation(user) {
		
	if(monkey.getUser() != null){
		monkey.getAllConversations(function(err, res){
	        if(err){
	            console.log(err);
	        }else if(res){
		        let conversations = {};
		        let users = {};
		        res.data.conversations.map (conversation => {
			        if(!Object.keys(conversation.info).length)
			        	return;
			        
			        let message = defineBubbleMessage(conversation.last_message);
			        let conversationTmp = {
				    	id: conversation.id,
				    	name: conversation.info.name,
				    	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
				    	messages: {
				    		[message.id]: message
				    	},
				    	lastMessage: message.id
			    	}
			    	
			        if(isConversationGroup(conversation.id)){
				        conversationTmp.members = conversation.members;
			        }else{
				        conversationTmp.lastOpenMe = undefined,
				    	conversationTmp.lastOpenApp = undefined,
				    	conversationTmp.online = undefined
				    	
				    	let userTmp = {
					    	id: conversation.id,
					    	name: conversation.info.name
				    	}
				    	users[userTmp.id] = userTmp;
			        }
			        conversations[conversationTmp.id] = conversationTmp;
		        })
		        
		        store.dispatch(actions.addConversations(conversations));
		        if(Object.keys(users).length){
			        store.dispatch(actions.addUsersContact(users));
		        }
		        monkey.getPendingMessages();
	        }
	    });
	}else{
		let conversationId = 'G:1';
		if(isConversationGroup(conversationId)) { // group conversation
			monkey.getInfoById(conversationId, function(error, data){
		        if(data != undefined){
			        var _members = data.members;
			        var _info = {name: 'Support: '+user.name}
			        monkey.createGroup(_members, _info, null, null, function(error, data){ // create new group
				        
				        if(data != undefined){
				        	let newConversation = {
					        	id: data.group_id,
					        	name: data.group_info.name,
					        	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
					        	unreadMessageCount: 0,
					        	members: data.members_info,
					        	messages: {}
				        	};
				        	store.dispatch(actions.addConversation(newConversation));
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
}

function prepareMessage(message) {
	
	switch (message.bubbleType){
		case 'text': { // bubble text
			let mokMessage = monkey.sendEncryptedMessage(message.text, message.recipientId, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'image': { // bubble image
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'file': { // bubble file
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'audio': { // bubble audio
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
	}
}

function defineMessage(mokMessage) {
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;

	if(!store.getState().conversations[conversationId]){ // handle does not exits conversations
		return;
	}
	
	let message = defineBubbleMessage(mokMessage);
	switch (mokMessage.protocolType){
		case 1:{
			console.log('App - Case 1')
			break;
		}
		case 2:{
			if(mokMessage.props.file_type == 1){ // audio
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('App - audio downloaded');
					let src = 'data:audio/mpeg;base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log('App - '+mokMessage.id);
					console.log('App - '+mokMessage.oldId);
					console.log('App - '+conversationId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
				
			}else if(mokMessage.props.file_type == 3){ // image
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('App - image downloaded');
					let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log('App - '+mokMessage.id);
					console.log('App - '+mokMessage.oldId);
					console.log('App - '+conversationId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
			}else if(mokMessage.props.file_type == 4){ // file
				monkey.downloadFile(mokMessage, function(err, data){
					console.log('App - file downloaded');
					console.log(data);
					let src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
					let message = {
						id: mokMessage.id,
						data: src
					}
					console.log('App - '+mokMessage.id);
					console.log('App - '+mokMessage.oldId);
					console.log('App - '+conversationId);
					store.dispatch(actions.updateMessageData(message, conversationId));
				});
			}
			break;
		}
		case 207:{
			store.dispatch(actions.deleteMessage(message, conversationId));
			return;
		}
	}
	if(message){
		store.dispatch(actions.addMessage(message, conversationId));
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
		status: 50
    }
    
    let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;
    if(isConversationGroup(conversationId)) { // group conversation
	    store.getState().conversations[conversationId].members.map( member => {
		    if(member.monkey_id === message.senderId){
			    message.name = member.name;
		    }
	    });
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
    	default:
    		break;
    }
    return message;
}