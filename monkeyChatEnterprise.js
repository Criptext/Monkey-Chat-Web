import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from 'react-monkey-ui'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './utils/monkey-utils.js'
import * as vars from './utils/monkey-const.js'

import { applyMiddleware, createStore, compose } from 'redux'
import reducer from './reducers'
import * as actions from './actions'

const monkey = new Monkey ();

const middlewares = [];
if (process.env.NODE_ENV === 'development') {
	const createLogger = require('redux-logger');
	const logger = createLogger();
	middlewares.push(logger);
}

const store = compose(applyMiddleware(...middlewares))(createStore)(reducer, {conversations: {}, users: {userSession: monkey.getUser()}});

const OFFLINE = 0;
const DISCONNECTED = 1;
const CONNECTING = 2;
const CONNECTED = 3;
const colorUsers = ["#6f067b","#00a49e","#b3007c","#b4d800","#e20068","#00b2eb","#ec870e","#84b0b9","#3a6a74","#bda700","#826aa9","#af402a","#733610","#020dd8","#7e6565","#cd7967","#fd78a7","#009f62","#336633","#e99c7a","#000000"];

var IDDIV, MONKEY_APP_ID, MONKEY_APP_KEY, MONKEY_DEBUG_MODE, ACCESS_TOKEN, VIEW, STYLES, COMPANY_NAME, CONVERSATION_ID;
var pendingMessages;
var monkeyChatInstance;
var mky_focused = true;

class MonkeyChat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined,
			conversationId: undefined,
			loading: false,
			connectionStatus : 0,
		}
		
		this.handleUserSession = this.handleUserSession.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleMessageDownloadData = this.handleMessageDownloadData.bind(this);
		this.handleMessageGetUser = this.handleMessageGetUser.bind(this);

	}
	
	componentWillReceiveProps(nextProps) {
		if(Object.keys(nextProps.store.conversations).length && this.state.conversationId == undefined){ // handle define only one conversation
			this.setState({conversationId: nextProps.store.conversations[Object.keys(nextProps.store.conversations)[0]].id});
		}
		if(nextProps.store.users.userSession && this.state.loading){ // handle stop loading when foun user session
			this.setState({loading: false});
		}
	}
	
	componentWillMount() {
		if(monkey.getUser() != null){
			this.setState({loading: false});
		}
	}
	
	render() {
		return (
			<MonkeyUI view={VIEW}
				styles={STYLES}
				viewLoading={this.state.loading}
				userSession={this.props.store.users.userSession}
				onUserSession={this.handleUserSession}
				conversations={this.props.store.conversations}
				conversation={this.props.store.conversations[this.state.conversationId]} 
				onConversationOpened={this.handleConversationOpened}
				onMessagesLoad={this.handleMessagesLoad}
				onMessage={this.handleMessage}
				onMessageDownloadData={this.handleMessageDownloadData}
				onMessageGetUser={this.handleMessageGetUser} 
				onLoadMoreConversations = {this.handleLoadConversations} />
		)
	}
	
	/* User */
	
	handleUserSession(user) {
		this.setState({loading: true});
		
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, user, [], true, MONKEY_DEBUG_MODE, false, false, (error, success) => {
			this.setState({viewLoading: false});
			if(error){
				monkey.logout();
				window.errorMsg = "Sorry, Unable to load your data. Please wait a few minutes before trying again."
			}else{
				store.dispatch(actions.addUserSession(user));	
			}
		}); // monkey create monkeyId dynamically, when user doesn't have monkeyId.
	}
	
	/* Conversation */
	
	handleConversationOpened(conversation) {
		monkey.sendOpenToUser(conversation.id);
	}
	
	/* Message */
	
	handleMessage(message) {
		createMessage(message);
	}
	
	handleMessagesLoad(conversationId, firstMessageId) {
		let conversation = {
			id: conversationId,
			loading: true
		}
		store.dispatch(actions.updateConversationLoading(conversation));
		
		monkey.getConversationMessages(conversationId, 10, firstMessageId, function(err, res){
			if(err){
	            console.log(err);
	        }else if(res){
		        if(res.length){
			    	let messages = {};
					res.map( mokMessage => {
						let message = defineBubbleMessage(mokMessage);
						if(message) {
							// define status							
/*
							if(message.datetimeCreation <= lastOpenMe) {
								message.status = 52;
							}
*/
							
							messages[message.id] = message;	
						}
					});
					let conversation = {
						id: conversationId,
						loading: false
					}
					
					store.dispatch(actions.addMessages(conversation, messages, false));
		        }else{
		        	let conversation = {
						id: conversationId,
						loading: false
					}
		        	store.dispatch(actions.updateConversationLoading(conversation));
		        }
			}
		});
	}

	handleMessageDownloadData(mokMessage){
		toDownloadMessageData(mokMessage);
	}
	
	handleMessageGetUser(userId){
		let user = store.getState().users[userId];
		if(!user){
			user = {};
		}
		let conversation = store.getState().conversations[this.state.conversationId];
		if(conversation && isConversationGroup(conversation.id)){
		 	var index = conversation.members.indexOf(userId);
		 	if(index >= 0){
	 			user.color = colorUsers[index%(colorUsers.length)];
		 	}else{
		 		user.color = '#8c8c8c'
		 	}
        }

		return user;
	}
}

function render() {
	monkeyChatInstance = ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementById(IDDIV));
}

store.subscribe(render);

window.monkeychat = {};
window.monkeychat.init = function(divIDTag, appid, appkey, accessToken, initalUser, debugmode, viewchat, customStyles, companyName){
	
	IDDIV = divIDTag;
	MONKEY_APP_ID = appid;
	MONKEY_APP_KEY = appkey;
	ACCESS_TOKEN = accessToken;
	MONKEY_DEBUG_MODE = debugmode;
	VIEW = viewchat;
	STYLES = customStyles != null ? customStyles : {};
	COMPANY_NAME = companyName;
	
	if(initalUser != null){
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, initalUser, [], false, MONKEY_DEBUG_MODE, false, false);
	}else if(monkey.getUser() != null){
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, monkey.getUser(), [], false, MONKEY_DEBUG_MODE, false, false);
	}

	render();
}

window.onfocus = function(){
	pendingMessages = 0;
	mky_focused = true;
	document.getElementById('mky-title').innerHTML = "Criptext Widget";
};
window.onblur = function(){
	mky_focused = false;
	pendingMessages = 0;
	var myConversations = store.getState().conversations;
	Object.keys(myConversations).forEach( (key) => {
		if(myConversations[key].unreadMessageCounter){
			pendingMessages = myConversations[key].unreadMessageCounter;
		}
	})
	if(pendingMessages){
		document.getElementById('mky-title').innerHTML = pendingMessages + " Pending Messages";
	}
	
};


// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('Connect', function(event) {
	let user = event;
	console.log(user);
	if(!store.getState().users.userSession){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}else if(!store.getState().users.userSession.id){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		getConversationByCompany(user.id, user);
	}else{
		monkey.getPendingMessages();
	}
});

// -------------- ON DISCONNECT --------------- //
monkey.on('Disconnect', function(event){
	console.log('App - Disconnect');
	
});

// --------------- ON EXIT ----------------- //
monkey.on('Exit', function(event) {
	console.log('App - Exit');
	monkey.logout();
	store.dispatch(actions.deleteUserSession());
	store.dispatch(actions.deleteConversations());
	conversationSelectedId = 0;
});

// --------------- ON MESSAGE ----------------- //
monkey.on('Message', function(mokMessage){
	console.log('App - Message');
	defineMessage(mokMessage);
});

// ------------ ON MESSAGE UNSEND -------------- //
monkey.on('MessageUnsend', function(mokMessage){
	console.log('App - MessageUnsend');
	
	let conversationId = mokMessage.recipientId;
	let message = {
		id: mokMessage.id
	}
	store.dispatch(actions.deleteMessage(message, conversationId));
});

// -------------- ON STATUS CHANGE --------------- //
monkey.on('StatusChange', function(data){
	console.log('App - StatusChange ' + data);

	var params = {};
	var panelParams = {};

	switch(data){
		case OFFLINE:
			params = {backgroundColor : "red", color : 'white', show : true, message : "No Internet Connection", fontSize : '15px'};
			break;
		case DISCONNECTED:
			var reconnectDiv = <div style={{fontSize : '15px'}}>You Have a Session somewhere else! <span className="mky-connect-link" onClick={ () => {monkey.startConnection()} } >Connect Here!</span></div>
			params = {backgroundColor : "black", color : 'white', show : true, message : reconnectDiv};
			break;
		case CONNECTING:
			params = {backgroundColor : "#FF9900", color : 'black', show : true, message : "Connecting...", fontSize : '15px'};
			break;
		case CONNECTED:
			params = {backgroundColor : "#429A38", color : 'white', show : false, message : "Connected!!", fontSize : '15px'};
			break;
		default:
			params = {};
	}
	//panelParams = {component : <ImageDummy/>, show : true, properties : params}

	panelParams = params;

	try{
		monkeyChatInstance.setState({
			panelParams : panelParams,
			connectionStatus : data
		})
	}catch(err){
		
	}
});

// ------------- ON NOTIFICATION --------------- //
monkey.on('Notification', function(data){
	console.log('App - Notification');
	
	let paramsType = Number(data.params.type);
	let conversationId = data.senderId;
	if(!store.getState().conversations[conversationId]){
    	return;
	}

	switch(paramsType) {
		case 20: {
				let conversation = {
					id: conversationId,
					description: null
				}
				store.dispatch(actions.updateConversationStatus(conversation));
			break;
		}
		case 21: {
				let conversation = {
					id: conversationId,
					description: 'typing...'
				}
				store.dispatch(actions.updateConversationStatus(conversation));
			break;
		}
		default:
            break;
	}
});

// -------------- ON ACKNOWLEDGE --------------- //
monkey.on('Acknowledge', function(data){
	console.log('App - Acknowledge');
	
	let conversationId = data.senderId;
	if(!store.getState().conversations[conversationId])
    	return;
	
	let message = {
		id: data.newId,
		oldId: data.oldId,
// 		status: Number(data.status),
		status: 50,
		recipientId: data.recipientId
	}
	store.dispatch(actions.updateMessageStatus(message, conversationId));
});

// ------- ON CONVERSATION OPEN RESPONSE ------- //
monkey.on('ConversationStatusChange', function(data){
	console.log('App - ConversationOpenResponse');

	let conversationId = CONVERSATION_ID;
	if(!store.getState().conversations[conversationId])
		return;

	let conversation = {
		id: conversationId,
		online: data.online
	}
	// define lastOpenMe
	if(data.lastOpenMe){
		conversation.lastOpenMe = Number(data.lastOpenMe)*1000;
	}
	// define lastOpenApp
	if(data.lastSeen){
		conversation.lastOpenApp = Number(data.lastSeen)*1000;
	}

	store.dispatch(actions.updateConversationStatus(conversation));
	// store.dispatch(actions.updateMessagesStatus(52, conversationId, true));
});

// ------------ ON CONVERSATION OPEN ----------- //
monkey.on('ConversationOpen', function(data){
	console.log('App - ConversationOpen');
	
	let conversationId = data.senderId;
	if(!store.getState().conversations[conversationId])
		return;
		
// 	store.dispatch(actions.updateMessagesStatus(52, conversationId, false));
});

// -------------- ON GROUP REMOVE -------------- //
monkey.on('GroupRemove', function(data){
	console.log('App - GroupRemove');

	if(store.getState().conversations[data.id]){
		store.dispatch(actions.removeMember(data.member, data.id));
	}
});



// MonkeyChat

// MonkeyChat: Conversation

function getConversationByCompany(monkeyId, user) {
	let params = { monkey_id: monkeyId,
				   access_token: ACCESS_TOKEN,
				   name : user.name};
	getConversationId(params, function(data){
		if (data != null){
			CONVERSATION_ID = data.data.group_id;
			console.log(data);
			loadConversations(user);
		}else{
			console.log('error');
		}
	});
}

function loadConversations(user) {
	if(monkey.getUser() != null){
		monkey.getConversations(Date.now(), 1, function(err, resConversation){
	        if(err){
	            console.log(err);
	        }else if(resConversation && resConversation.length > 0){
		        let conversations = {};
		        let users = {};
		        let usersToGetInfo = {};
		        resConversation.map (conversation => {
			        if(!Object.keys(conversation.info).length)
			        	return;
			        
			        if(conversation.id !== CONVERSATION_ID) // launch only with the conversation defined
			        	return;
			        	
			        // define message
			        let messages = {};
			        let messageId = null;
			        if (conversation.last_message.protocolType != 207){
			        	conversation.last_message.datetimeOrder = conversation.last_message.datetimeCreation;
			        	let message = defineBubbleMessage(conversation.last_message);
			        	if(message){
				        	messages[message.id] = message;
							messageId = message.id;	
			        	}
			        }
		        
					// define conversation
			        let conversationTmp = {
				    	id: conversation.id,
				    	name: conversation.info.name == undefined ? 'Unknown' : conversation.info.name,
				    	messages: messages,
				    	lastMessage: messageId,
						unreadMessageCounter: 0,
						description: null,
						loading: false
			    	}
			    	
			    	// avatar
			    	if(STYLES.avatar){
				    	conversationTmp.urlAvatar = STYLES.avatar;
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
					    conversationTmp.name = COMPANY_NAME;
				    	
			        }else{ // define personal conversation 
				        conversationTmp.lastOpenMe = undefined,
				    	conversationTmp.lastOpenApp = undefined,
				    	conversationTmp.online = undefined
				    	// add user into users
				    	let usersSize = Object.keys(store.getState().users).length - 1;
				    	let userTmp = {
					    	id: conversation.id,
					    	name: conversation.info.name == undefined ? 'Unknown' : conversation.info.name,
					    	color : colorUsers[(usersSize++)%(colorUsers.length)] 
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
				        if (id !== '' && id !== 'null'){
							ids.push(id);
				        }
			        })
			        
			        // get user info
			        monkey.getInfoByIds(ids, function(err, res){
				        if(err){
				            console.log(err);
				        }else if(res){
					        if(res.length){
						        let userTmp;
						        let usersSize = Object.keys(store.getState().users).length - 1;
						        // add user into users
						        res.map(user => {
							    	userTmp = {
								    	id: user.monkey_id,
								    	name: user.name == undefined ? 'Unknown' : user.name,
								    	color : colorUsers[(usersSize++)%colorUsers.length] 
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
	        
	        }else{
		        console.log('error get all conversation');
	        }
	    });
	}
}

function createConversation(user){
	let conversationId = CONVERSATION_ID;

	monkey.getInfoById(conversationId, function(err, data){
		if(err){
			console.log(err);
		}else if(data){
			console.log(data);
			if(isConversationGroup(conversationId)){
				let info = {name: 'Support: '+user.name}
				createGroupConversation(data.members, info);
			}else{
				store.dispatch(actions.addConversation(defineConversation(conversationId, null, data.name)));
			}
		} 
    });

    if(!mky_focused){
		pendingMessages++;
		document.getElementById('mky-title').innerHTML = pendingMessages + " Pending Messages";
	}
}

function createGroupConversation(members, info){
	monkey.createGroup(members, info, null, null, function(err, data){ // create new group
		if(err){
			console.log(err);
		}else{
			store.dispatch(actions.addConversation(defineConversation(data.group_id, null, COMPANY_NAME, data.members_info, data.members)));
		}
	});
}

function defineConversation(conversationId, mokMessage, name, members_info, members){
	// define message
	let messages = {};
	let messageId = null;
	let message = null;
	let unreadMessageCounter = 0;
	if(mokMessage){
		message = defineBubbleMessage(mokMessage);
	}
	if(message){
		messages[message.id] = message;
		messageId = message.id;
		unreadMessageCounter++;
	}

	// define conversation
	let conversation = {
		id: conversationId,
    	name: name,
    	messages: messages,
    	lastMessage: messageId,
    	unreadMessageCounter: unreadMessageCounter,
    	description: null,
    	loading: false
	}

	// define group conversation
	if(members_info){
		conversation.description = '';
		conversation.members = members;

		// get user info
		let users = {};
		let userTmp;
		members_info.map(user => {
			userTmp = {
		    	id: user.monkey_id,
		    	name: user.name == undefined ? 'Unknown' : user.name,
		    	color : colorUsers[(usersSize++)%colorUsers.length]
		    }
		    users[userTmp.id] = userTmp;
		});
		store.dispatch(actions.addUsersContact(users));
	}else{ // define personal conversation
		conversation.lastOpenMe = undefined;
    	conversation.lastOpenApp = undefined;
    	conversation.online = undefined;
	}

	return conversation;
}

// MonkeyChat: Message

function createMessage(message) {
	
	switch (message.bubbleType){
		case 'text': { // bubble text
			let mokMessage = monkey.sendEncryptedMessage(message.text, message.recipientId, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder*1000;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'image': { // bubble image
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder*1000;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'file': { // bubble file
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder*1000;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
		case 'audio': { // bubble audio
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: message.length}, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = mokMessage.datetimeCreation*1000;
			message.datetimeOrder = mokMessage.datetimeOrder*1000;
			store.dispatch(actions.addMessage(message, message.recipientId));
			break;
		}
	}
}

function defineMessage(mokMessage) {
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;
	var conversation = store.getState().conversations[conversationId];
	var notification_text = "";

	if(!conversation) { // handle does not exits conversations
		createConversation(conversationId, mokMessage);
		return;
	}else{
		if(conversation.messages[mokMessage.id] != null){
			return;
		}
	}
	
	let message = defineBubbleMessage(mokMessage);
	
	if(message){
		// define status	
/*
		if( message.datetimeCreation <= store.getState().conversations[conversationId].lastOpenMe ){
			message.status = 52;
		}
*/
		if(store.getState().conversations[conversationId].unreadMessageCounter <= 0 && !mky_focused){
			
			pendingMessages++;
			document.getElementById('mky-title').innerHTML = pendingMessages + " Pending Messages";
		
		}
		store.dispatch(actions.addMessage(message, conversationId, false));

		if( (!conversation.lastMessage || conversation.messages[conversation.lastMessage].datetimeOrder < message.datetimeOrder) && store.getState().users.userSession.id != mokMessage.senderId && !mky_focused){
			monkey.closePush(conversation.lastMessage);
			if (conversation.id.substring(0, 2) == "G:") {
			    notification_text = store.getState().users[message.senderId].name + ' has sent a message to ' + conversation.name + '!';
			}else{
				notification_text = store.getState().users[message.senderId].name + ' has sent You a message!';
			}
			monkey.createPush(notification_text, message.preview, 4000, message.id, conversation.urlAvatar, function(){
				monkey.closePush(message.id);
				window.focus();
				monkeyChatInstance.handleConversationOpened(conversation);
			})
		}
	}
}

function defineBubbleMessage(mokMessage){
	if (!mokMessage.id)
		return;
	
	let message = {
    	id: mokMessage.id.toString(),
    	oldId: mokMessage.oldId,
    	datetimeCreation: mokMessage.datetimeCreation*1000,
		datetimeOrder: mokMessage.datetimeOrder*1000,
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
			message.data = null;
			message.error = false;
			
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
	    	}else{
		    	return "";
	    	}
    	}
    		break;
    	case 207:{
			return "";
		}
    	default:
    		break;
    }
    return message;
}

function toDownloadMessageData(mokMessage){
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;
	let message = {
			id: mokMessage.id,
			isDownloading: true
	};
    store.dispatch(actions.updateMessageDataStatus(message, conversationId));
    
	switch(parseInt(mokMessage.props.file_type)){
		case 1: // audio
			monkey.downloadFile(mokMessage, function(err, data){
				let message = {
					id: mokMessage.id,
					data: null,
					error: true
				};
				if(err){
		            console.log(err);
		        }else{
			        console.log('App - audio downloaded');
					let mime = 'audio/mpeg';
			        if(mokMessage.props.mime_type){
				        mime = mokMessage.props.mime_type;
			        }
					let src = `data:${mime};base64,${data}`;
					message.data = src;
					message.error = false;
		        }
		        store.dispatch(actions.updateMessageData(message, conversationId));
			});
			break;
		case 3: // image
			monkey.downloadFile(mokMessage, function(err, data){
				let message = {
					id: mokMessage.id,
					data: null,
					error: true
				};
				if(err){
		            console.log(err);
		        }else{
			        console.log('App - image downloaded');
					let src = `data:${mokMessage.props.mime_type};base64,${data}`;
					message.data = src;
					message.error = false;
		        }
		        store.dispatch(actions.updateMessageData(message, conversationId));
			});
			break;
		case 4: // file
			monkey.downloadFile(mokMessage, function(err, data){
				let message = {
					id: mokMessage.id,
					data: null,
					error: true
				};
				if(err){
		            console.log(err);
		        }else{
			        console.log('App - file downloaded');
					let src = `data:${mokMessage.props.mime_type};base64,${data}`;
					message.data = src;
					message.error = false;
		        }
		        store.dispatch(actions.updateMessageData(message, conversationId));
			});
			break;
	}
}

// API Criptext

function getConversationId(params, onSuccess) {
	apiCriptextCall(params,'POST','/service/group/add',function(err, response){
        if(err){
            return onError(err);
        }
        onSuccess(response);
    });
}

function apiCriptextCall(params, type, endpoint, callback){

    switch(type) {
        case "GET":
            $.ajax({
                type    : type,
                url     : vars.API_CRIPTEXT_URL+endpoint,
                crossDomain: true,
                dataType: "json", 
                success: function(respObj){
                    callback(null, respObj);
                },
                error: function(err){
                    console.log("Error :"+JSON.stringify(err));
                    callback(err);
                }
            });
            break;
        case "POST":
            $.ajax({
                type    : type,
                url     : vars.API_CRIPTEXT_URL+endpoint,
                crossDomain: true,
                dataType: "json",
                data    : params,
                success: function(respObj){
                    //console.log("RespObj:"+JSON.stringify(respObj));
                    callback(null, respObj);
                },
                error: function(err){
                    console.log("Error :"+JSON.stringify(err));
                    callback(err);   
                }
            });
            break;
        default:
            console.log("Unknown weather type!");
            break;
    }    
}

// MonkeyChat: Push

function createPush(conversationId, pushKey) {

	const username = store.getState().users.userSession.name;
    let pushLocalization;
    let text;
	let locArgs;

    if (!isConversationGroup(conversationId)) {
	    locArgs = [username];
        switch(pushKey) {
            case 1: // text message
                pushLocalization = 'pushtextKey';
                text = username+' sent you a message';
                break;
            case 2: // private text message
                pushLocalization = 'pushprivatetextKey';
                text = username+' sent you a private message';
                break;
            case 3: // audio message
                pushLocalization = 'pushaudioKey';
                text = username+' sent you an audio';
                break;
            case 4: // private audio message
                pushLocalization = 'pushprivateaudioKey';
                text = username+' sent you a private audio';
                break;
            case 5: // image message
                pushLocalization = 'pushimageKey';
                text = username+' sent you an image';
                break;
            case 6: // private image message
                pushLocalization = 'pushprivateimageKey';
                text = username+' sent you a private image';
                break;
            case 7: // file message
                pushLocalization = 'pushfileKey';
                text = username+' sent you a file';
                break;
            case 8: // contact message
                pushLocalization = 'pushcontactKey';
                text = username+' sent you a contact';
                break;
        }
    }else{ // to group
	    var groupName = store.getState().conversations[conversationId].name;
	    locArgs = [username, groupName];
        switch(pushKey){
            case 1: // text message
                pushLocalization = 'grouppushtextKey';
                text = username+' sent a message to';
                break;
            case 2: // private text message
                pushLocalization = 'grouppushprivatetextKey';
                text = username+' sent a private message to';
                break;
            case 3: // audio message
                pushLocalization = 'grouppushaudioKey';
                text = username+' sent an audio to';
                break;
            case 4: // private audio message
                pushLocalization = 'grouppushprivateaudioKey';
                text = username+' sent a private audio to';
                break;
            case 5: // image message
                pushLocalization = 'grouppushimageKey';
                text = username+' sent an image to';
                break;
            case 6: // private image message
                pushLocalization = 'grouppushprivateimageKey';
                text = username+' sent a private image to';
                break;
            case 7: // file message
                pushLocalization = 'pushfileKey';
                text = username+' sent you a file to';
                break;
            case 8: // contact message
                pushLocalization = 'grouppushcontactKey';
                text = username+' sent a contact to';
                break;
        }
    }
    return monkey.generateLocalizedPush(pushLocalization, locArgs, text);
}