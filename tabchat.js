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

var MONKEY_APP_ID, MONKEY_APP_KEY, MONKEY_DEBUG_MODE, CONVERSATION_ID, VIEW, STYLES;

class MonkeyChat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined
		}
		this.handleMessageToSet = this.handleMessageToSet.bind(this);
		this.handleUserSessionToSet = this.handleUserSessionToSet.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
		this.handleGetUserName = this.handleGetUserName.bind(this);
	}
	
	componentWillReceiveProps(nextProps) {
		if(Object.keys(nextProps.store.conversations).length){ // handle conversation define by props
			this.setState({conversation: nextProps.store.conversations[Object.keys(nextProps.store.conversations)[0]]});
		}
	}
	
	componentWillMount() {
	}
	
	render() {
		return (
			<MonkeyUI view={VIEW} userSession={this.props.store.users.userSession} conversation={this.state.conversation} conversations={this.props.store.conversations} userSessionToSet={this.handleUserSessionToSet} messageToSet={this.handleMessageToSet} conversationOpened={this.handleConversationOpened} loadMessages={this.handleLoadMessages} form={MyForm} onClickMessage={this.handleOnClickMessage} dataDownloadRequest={this.handleDownloadData} getUserName={this.handleGetUserName} styles={STYLES}/>
		)
	}

	componentDidMount() {
	}
	
	handleUserSessionToSet(user) {
		store.dispatch(actions.addUserSession(user));
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, user, true, MONKEY_DEBUG_MODE);
	}
	
	handleMessageToSet(message) {
		prepareMessage(message);
	}
	
	handleConversationOpened(conversation) {
		monkey.sendOpenToUser(conversation.id);
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
					store.dispatch(actions.addMessages(messages, conversationId, false));
		        }
			}
		});
	}
	
	handleOnClickMessage(message) {
		
	}

	handleDownloadData(mokMessage){
		toDownloadMessageData(mokMessage);
	}
	
	handleGetUserName(userId){
		return store.getState().users[userId].name ? store.getState().users[userId].name : 'Unknown';
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

store.subscribe(render);

window.monkeychat = {};
window.monkeychat.init = function(appid, appkey, conversationId, initalUser, debugmode, viewchat, customStyles){
	
	MONKEY_APP_ID = appid;
	MONKEY_APP_KEY = appkey;
	MONKEY_DEBUG_MODE = debugmode;
	CONVERSATION_ID = conversationId;
	VIEW = viewchat;
	STYLES = customStyles != null ? customStyles : {};
	
	if(initalUser!=null){
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, initalUser, false, MONKEY_DEBUG_MODE, false);
	}
	else if(monkey.getUser() != null){
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, monkey.getUser(), false, MONKEY_DEBUG_MODE, false);
	}

	render();
}

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

function addConversation(user) {	
	if(monkey.getUser() != null){
		monkey.getAllConversations(function(err, res){
	        if(err){
	            console.log(err);
	        }
	        else if(res && res.data.conversations.length > 0){
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
				        conversationTmp.members = conversation.members;
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
	        else{
	        	prepareConversation(user);
	        }
	    });
	}else{
		prepareConversation(user);
	}	
}

function prepareConversation(user){
	let conversationId = CONVERSATION_ID;
	if(isConversationGroup(conversationId)) { // group conversation
		monkey.getInfoById(conversationId, function(error, data){
	        if(data != undefined){
		        var _members = data.members;
		        var _info = {name: 'Support: '+user.name}
		        monkey.createGroup(_members, _info, null, null, function(error, data){ // create new group
			        
			        if(data != undefined){
				        // define group conversation
			        	let newConversation = {
				        	id: data.group_id,
				        	name: data.group_info.name,
				        	urlAvatar: 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png',
				        	unreadMessageCount: 0,
				        	members: data.members,
				        	messages: {},
				        	description: ''
			        	}
			        	
			        	// get user info
			        	let users = {};
				        monkey.getInfoByIds(data.members, function(err, res){
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
					        store.dispatch(actions.addConversation(newConversation));
				        });
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
			console.log('App - '+mokMessage.id);
			console.log('App - '+mokMessage.oldId);
			console.log('App - '+conversationId);
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
			console.log('App - '+mokMessage.id);
			console.log('App - '+mokMessage.oldId);
			console.log('App - '+conversationId);
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
			console.log('App - '+mokMessage.id);
			console.log('App - '+mokMessage.oldId);
			console.log('App - '+conversationId);
			store.dispatch(actions.updateMessageData(message, conversationId));
		});
		break;
	}
}