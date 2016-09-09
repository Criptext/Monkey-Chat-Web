import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from 'react-monkey-ui'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './utils/monkey-utils.js'
import * as vars from './utils/monkey-const.js'

import { applyMiddleware, createStore, compose } from 'redux'
import reducer from './reducers'
import * as actions from './actions'

const middlewares = [];
if (process.env.NODE_ENV === 'development') {
	const createLogger = require('redux-logger');
	const logger = createLogger();
	middlewares.push(logger);
}
const monkey = new Monkey ();
const store = compose(applyMiddleware(...middlewares))(createStore)(reducer, {conversations: {}, users: {userSession: monkey.getUser()}});

const OFFLINE = 0;
const DISCONNECTED = 1;
const CONNECTING = 2;
const CONNECTED = 3;
const colorUsers = ["#6f067b","#00a49e","#b3007c","#b4d800","#e20068","#00b2eb","#ec870e","#84b0b9","#3a6a74","#bda700","#826aa9","#af402a","#733610","#020dd8","#7e6565","#cd7967","#fd78a7","#009f62","#336633","#e99c7a","#000000"];

var IDDIV, MONKEY_APP_ID, MONKEY_APP_KEY, MONKEY_DEBUG_MODE, ACCESS_TOKEN, VIEW, STYLES, WIDGET_CUSTOMS, ENCRYPTED, CONVERSATION_ID;
var pendingMessages;
var monkeyChatInstance;
var mky_focused = true;
var firstTimeLogIn = true;
var initialTitle = "";

class MonkeyChat extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			conversation: undefined,
			conversationId: undefined,
			loading: false,
			connectionStatus: 0,
			membersOnline : []
		}

		this.handleUserSession = this.handleUserSession.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleMessageDownloadData = this.handleMessageDownloadData.bind(this);
		this.handleMessageGetUser = this.handleMessageGetUser.bind(this);
		this.handleConversationLoadInfo = this.handleConversationLoadInfo.bind(this);
		this.handleConversationExitButton = this.handleConversationExitButton.bind(this);

		if(document.getElementById('mky-title')){
			initialTitle = document.getElementById('mky-title').innerHTML;
		}
	}
	
	componentWillMount() {
		if(monkey.getUser() != null){
			this.setState({loading: true});
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if(Object.keys(nextProps.store.conversations).length && this.state.conversationId == undefined){ // handle define only one conversation
			var conversationId = nextProps.store.conversations[Object.keys(nextProps.store.conversations)[0]].id
			this.setState({conversationId: conversationId});
			if(!nextProps.store.conversations[conversationId].lastMessage && typeof WIDGET_CUSTOMS == 'object' && WIDGET_CUSTOMS.welcomeText){
				var userIds = Object.keys(nextProps.store.users);
				userIds.splice(userIds.indexOf(nextProps.store.users.userSession.id), 1);
				userIds.splice(userIds.indexOf('userSession'), 1);
				var mokMessage = {
					datetimeCreation: Date.now()/1000,
					datetimeOrder: Date.now()/1000,
					id:"abc123",
					protocolCommand:200,
					protocolType:1,
					readByUser:false,
					recipientId:conversationId,
					senderId:userIds[Math.floor(Math.random()*userIds.length)],
					text: WIDGET_CUSTOMS.welcomeText.replace("<name>", nextProps.store.users.userSession.name)
				}
				defineMessage(mokMessage);
			}

			if(isConversationGroup(conversationId)){
				let conversation = store.getState().conversations[conversationId];
				let members = listMembers(conversation.members);
				conversation['description'] = members;
				store.dispatch(actions.updateConversationStatus(conversation));
			}
		}
		if(nextProps.store.users.userSession && this.state.loading){ // handle stop loading when foun user session
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
				onLoadMoreConversations = {this.handleLoadConversations} 
				onConversationLoadInfo = {this.handleConversationLoadInfo}/>
		)
	}
	
	/* User */
	
	handleUserSession(user) {
		this.setState({loading: true});
		
		// monkey create monkeyId dynamically, when user doesn't have monkeyId.
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, user, [], false, MONKEY_DEBUG_MODE, false, false, (error, success) => {
			this.setState({viewLoading: false});
			if(error){
				monkey.logout();
				window.errorMsg = "Sorry, Unable to load your data. Please wait a few minutes before trying again."
			}else{
				store.dispatch(actions.addUserSession(user));	
			}
		});
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
							/*
							//define status	
							if(message.datetimeCreation <= lastOpenMe) {
-								message.status = 52;
-							}*/
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

	handleConversationLoadInfo(){
		var objectInfo = {};
		var userIsAdmin = false;
		objectInfo.users = [];
		let users = store.getState().users;
		let conversations = store.getState().conversations;
		let conversation = store.getState().conversations[this.state.conversationId];


		objectInfo.name = conversation.name;
		objectInfo.avatar = conversation.urlAvatar;

		if(isConversationGroup(this.state.conversationId)){
			conversation.members.forEach( (member) => {
				if(!member){
					return;
				}
				let user = users[member];
				if(this.state.membersOnline.indexOf(user.id) > -1 || users.userSession.id == user.id){
					user.description = "Online";
				}else{
					user.description = "Offline";
				}

				if(conversation.admin && conversation.admin.indexOf(user.id) > -1){
					user.rol = "Admin";
					if(user.id == users.userSession.id){
						userIsAdmin = true;
					}
				}else{
					user.rol = null;
				}

				objectInfo.users.push(user);
			})
			objectInfo.title = 'Group Info';
			objectInfo.subTitle = 'Participants';

			objectInfo.button = {
				text : 'Sign out',
				func : this.handleConversationExitButton,
			}
		}else{
			objectInfo.title = 'User Info';
			objectInfo.subTitle = 'Conversations With ' + conversation.name;
			Object.keys(conversations).forEach(key => {
				if(conversations[key].members && conversations[key].members.indexOf(conversation.id) > -1){
					objectInfo.users.push({avatar : conversations[key].urlAvatar, name : conversations[key].name, description : conversations[key].members.length + " Loaded Messages"})
				}
			})
		}
		
		return objectInfo;
	}

	handleConversationExitButton(){
		firstTimeLogIn = true;
		this.setState({conversationId: null});
		monkey.logout();
		store.dispatch(actions.deleteUserSession());
		store.dispatch(actions.deleteConversations());
	}
}

function render() {
	monkeyChatInstance = ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementById(IDDIV));
}

store.subscribe(render);

window.monkeychat = {};
window.monkeychat.init = function(divIDTag, appid, appkey, accessToken, initalUser, debugmode, viewchat, customStyles, customs, encrypted){
	
	IDDIV = divIDTag;
	MONKEY_APP_ID = appid;
	MONKEY_APP_KEY = appkey;
	ACCESS_TOKEN = accessToken;
	MONKEY_DEBUG_MODE = debugmode;
	VIEW = viewchat;
	STYLES = customStyles != null ? customStyles : {};
	WIDGET_CUSTOMS = customs;
	if(typeof encrypted === 'boolean'){
		ENCRYPTED = encrypted;
	}else{
		ENCRYPTED = true;
	}
	
	if(initalUser != null){
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, initalUser, [], false, MONKEY_DEBUG_MODE, false, false);
	}else if(monkey.getUser() != null){
		firstTimeLogIn = false;
		monkey.init(MONKEY_APP_ID, MONKEY_APP_KEY, monkey.getUser(), [], false, MONKEY_DEBUG_MODE, false, false);
	}

	render();
}

window.onfocus = function(){
	pendingMessages = 0;
	mky_focused = true;
	if(document.getElementById('mky-title')){
		document.getElementById('mky-title').innerHTML = initialTitle;
	}
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
	if(pendingMessages && document.getElementById('mky-title')){
		document.getElementById('mky-title').innerHTML = pendingMessages + " Pending Messages";
	}
	
};


// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('Connect', function(event) {
	let user = event;
	if(!store.getState().users.userSession || !store.getState().users.userSession.id){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		if(firstTimeLogIn){
			getConversationByCompany(user.id, user);
		}else{
			loadConversations(user);
		}
	}else{
		monkey.getPendingMessages();
	}
});

// -------------- ON DISCONNECT --------------- //
monkey.on('Disconnect', function(event){
	
});

// --------------- ON EXIT ----------------- //
monkey.on('Exit', function(event) {
	monkey.logout();
	store.dispatch(actions.deleteUserSession());
	store.dispatch(actions.deleteConversations());
	conversationSelectedId = 0;
});

// --------------- ON MESSAGE ----------------- //
monkey.on('Message', function(mokMessage){
	defineMessage(mokMessage);
});

// ------------ ON MESSAGE UNSEND -------------- //
monkey.on('MessageUnsend', function(mokMessage){
	
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId
	let conversation = store.getState().conversations[conversationId];
	if(!conversation || !conversation.messages[mokMessage.id]){
		return;
	}
	let message = {
		id: mokMessage.id
	}

	store.dispatch(actions.deleteMessage(message, conversationId));
});

// -------------- ON STATUS CHANGE --------------- //
monkey.on('StatusChange', function(data){

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

	let conversationId = CONVERSATION_ID;
	if(!store.getState().conversations[conversationId])
		return;

	let conversation = {
		id: conversationId,
	}

	if(typeof data.online !== "boolean" && isConversationGroup(conversationId)){
		monkeyChatInstance.setState({
			membersOnline : data.online.split(","),
		});
		return;
	}else if(data.online && !isConversationGroup(conversationId)){
		conversation.description = "online";
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

	let conversationId = data.senderId;
	if(!store.getState().conversations[conversationId])
		return;
		
// 	store.dispatch(actions.updateMessagesStatus(52, conversationId, false));
});

// -------------- ON GROUP REMOVE -------------- //
monkey.on('GroupRemove', function(data){

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
						loading: false,
						admin: conversation.info.admin
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
					    conversationTmp.name = typeof WIDGET_CUSTOMS == "string" ? WIDGET_CUSTOMS : WIDGET_CUSTOMS.name;
				    	
			        }else{ // define personal conversation 
				        conversationTmp.lastOpenMe = undefined,
				    	conversationTmp.lastOpenApp = undefined,
				    	conversationTmp.online = undefined
				    	// add user into users
				    	let usersSize = Object.keys(store.getState().users).length - 1;
				    	let userTmp = {
					    	id: conversation.id,
					    	name: conversation.info.name == undefined ? 'Unknown' : conversation.info.name,
					    	color : colorUsers[(usersSize++)%(colorUsers.length)],
					    	avatar : conversation.info.avatar ? conversation.info.avatar : 'https://cdn.criptext.com/MonkeyUI/images/userdefault.png'
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
								    	avatar : user.avatar ? user.avatar : 'https://cdn.criptext.com/MonkeyUI/images/userdefault.png',
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
		        monkeyChatInstance.handleConversationExitButton();
	        }
	    });
	}
}

function defineConversation(conversationId, mokMessage, name, members_info, members, admin){
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
		conversation.admin = admin;
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
			let push = createPush(message.recipientId, message.bubbleType);
			push.andData['session-id'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			push.iosData['category'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			let mokMessage = monkey.sendText(message.text, message.recipientId, ENCRYPTED, null, push);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'image': { // bubble image
			let push = createPush(message.recipientId, message.bubbleType);
			push.andData['session-id'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			push.iosData['category'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			let mokMessage = null;
			if(ENCRYPTED){
				mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, push);
			}else{
				mokMessage = monkey.sendFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, push);
			}
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'file': { // bubble file
			let push = createPush(message.recipientId, message.bubbleType);
			push.andData['session-id'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			push.iosData['category'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			let mokMessage = null;
			if(ENCRYPTED){
				mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, push);
			}else{
				mokMessage = monkey.sendFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, push);
			}
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'audio': { // bubble audio
			let push = createPush(message.recipientId, message.bubbleType);
			push.andData['session-id'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			push.iosData['category'] = isConversationGroup(message.recipientId) ? message.recipientId : store.getState().users.userSession.id;
			let mokMessage = null;
			if(ENCRYPTED){
				mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: message.length}, push);
			}else{
				mokMessage = monkey.sendFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: message.length}, push);
			}
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
	}
}

function defineMessage(mokMessage) {
	let conversationId = store.getState().users.userSession.id == mokMessage.recipientId ? mokMessage.senderId : mokMessage.recipientId;
	var conversation = store.getState().conversations[conversationId];
	var notification_text = "";

	if(!conversation) { // handle does not exits conversations
		//createConversation(conversationId, mokMessage);
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
		if(store.getState().conversations[conversationId].unreadMessageCounter <= 0 && !mky_focused && document.getElementById('mky-title')){
			
			pendingMessages++;
			document.getElementById('mky-title').innerHTML = pendingMessages + " Pending Messages";
		
		}
		store.dispatch(actions.addMessage(message, conversationId, false));

		if( (!conversation.lastMessage || conversation.messages[conversation.lastMessage].datetimeOrder < message.datetimeOrder) && store.getState().users.userSession.id != mokMessage.senderId && !mky_focused){
			monkey.closePush(conversation.lastMessage);
			if (isConversationGroup(conversation.id)) {
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
		    	return '';
	    	}
    	}
    		break;
    	case 207:{
			return '';
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
		            return console.log(err);
		        }
	
		        console.log('App - file downloaded');
				//let src = `data:${mokMessage.props.mime_type};base64,${data}`;
				var blob = base64toBlob(data, mokMessage.props.mime_type);
				var url = URL.createObjectURL(blob);
		        message.data = url;
				message.error = false;
				message.isDownloading = false;
		        store.dispatch(actions.updateMessageData(message, conversationId));
				store.dispatch(actions.updateMessageDataStatus(message, conversationId));

			});

		break;
	}
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
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

function createPush(conversationId, bubbleType) {

	const username = store.getState().users.userSession.name;
    let pushLocalization;
    let text;
	let locArgs;

    if (!isConversationGroup(conversationId)) {
	    locArgs = [username];
        switch(bubbleType) {
            case 'text': // text message
                pushLocalization = 'pushtextKey';
                text = username+' sent you a message';
                break;
            case 'audio': // audio message
                pushLocalization = 'pushaudioKey';
                text = username+' sent you an audio';
                break;
            case 'image': // image message
                pushLocalization = 'pushimageKey';
                text = username+' sent you an image';
                break;
            case 'file': // file message
                pushLocalization = 'pushfileKey';
                text = username+' sent you a file';
                break;
        }
    }else{ // to group
	    var groupName = store.getState().conversations[conversationId].name;
	    locArgs = [username, groupName];
        switch(bubbleType){
            case 'text': // text message
                pushLocalization = 'grouppushtextKey';
                text = username+' sent a message to';
                break;
            case 'audio': // audio message
                pushLocalization = 'grouppushaudioKey';
                text = username+' sent an audio to';
                break;
            case 'image': // image message
                pushLocalization = 'grouppushimageKey';
                text = username+' sent an image to';
                break;
            case 'file': // file message
                pushLocalization = 'pushfileKey';
                text = username+' sent you a file to';
                break;
        }
    }
    return monkey.generateLocalizedPush(pushLocalization, locArgs, text);
}

function listMembers(members){
	var list;
	if(typeof members == "string"){
		list = members.split(',');
	}else{
		list = members;
	}
	var names = [];
	var users = store.getState().users;

	list.map(function(id) {
		if(users[id] && users[id].name){
			names.push(users[id].name.split(" ")[0]);
		}
    })
	return names.join(', ');
}

window.getMonkey = function(){
  return monkey;
}