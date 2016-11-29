import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { MonkeyUI, isConversationGroup } from 'react-monkey-ui'
import Monkey from 'monkey-sdk'
import { applyMiddleware, createStore, compose } from 'redux'
import { reducer, actions } from 'redux-monkey-chat'
import * as vars from './utils/monkey-const.js'

const middlewares = [];
if (process.env.NODE_ENV === 'development') {
	const createLogger = require('redux-logger');
	const logger = createLogger();
	middlewares.push(logger);
}
const monkey = new Monkey ();
const store = compose(applyMiddleware(...middlewares))(createStore)(reducer, {conversations: {}, users: {userSession: monkey.getUser()}});
const CONVERSATIONS_LOAD = 15;

var conversationSelectedId = 0;
var monkeyChatInstance;

class MonkeyChat extends Component {
	constructor(props){
		super(props);
		this.state = {
			conversationId: undefined,
			viewLoading: false,
			conversationsLoading: true,
			isLoadingConversations: false
		}
		
		this.view = {
			type: 'rightside',
			data: {
				width: '350px',
				height: '100%'
			}
		}
		
		this.handleUserSession = this.handleUserSession.bind(this);
		this.handleUserSessionLogout = this.handleUserSessionLogout.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
		this.handleConversationClosed = this.handleConversationClosed.bind(this);
		this.handleConversationLoadInfo = this.handleConversationLoadInfo.bind(this);
		this.handleMessagesLoad = this.handleMessagesLoad.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleMessageDownloadData = this.handleMessageDownloadData.bind(this);
		this.handleMessageGetUser = this.handleMessageGetUser.bind(this);
		this.handleNotifyTyping = this.handleNotifyTyping.bind(this);
		this.handleLoadConversations = this.handleLoadConversations.bind(this);
		this.handleRenameGroup = this.handleRenameGroup.bind(this);
		this.handleConversationExitButton = this.handleConversationExitButton.bind(this);
		this.handleMakeMemberAdmin = this.handleMakeMemberAdmin.bind(this);
		this.handleRemoveMember = this.handleRemoveMember.bind(this);
		
		/* options */
		this.handleSortConversations = this.handleSortConversations.bind(this);
		this.handleConversationDelete = this.handleConversationDelete.bind(this);
		this.options = {
			conversation: {
				onSort: this.handleSortConversations,
				optionsToDelete: {
					onExitGroup: undefined,
					onDelete: this.handleConversationDelete
				}
			},
			message: {
				optionsToIncoming: undefined,
				optionsToOutgoing: undefined
			}
		}
	}

	componentWillMount() {
		if(monkey.getUser() != null){
			this.setState({viewLoading: true});
			var user = monkey.getUser();
			monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, [], false, vars.MONKEY_DEBUG_MODE, false, false, (error, success) => {
				this.setState({viewLoading: false});
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.store.users.userSession && this.state.viewLoading){ // handle stop loading when foun user session
			this.setState({viewLoading: false});
		}
	}
	
	render() {
		return (
			<MonkeyUI view = {this.view}
				viewLoading = {this.state.viewLoading}
				options = {this.options}
				userSession = {this.props.store.users.userSession}
				onUserSession = {this.handleUserSession}
				onUserSessionLogout = {this.handleUserSessionLogout}
				conversations = {this.props.store.conversations}
				conversation = {this.props.store.conversations[this.state.conversationId]}
				conversationsLoading={this.state.conversationsLoading}
				onConversationOpened = {this.handleConversationOpened}
				onConversationClosed = {this.handleConversationClosed}
				onConversationLoadInfo = {this.handleConversationLoadInfo}
				onMessagesLoad = {this.handleMessagesLoad}
				onMessage = {this.handleMessage}
				onMessageDownloadData = {this.handleMessageDownloadData}
				onMessageGetUser = {this.handleMessageGetUser}
				onLoadMoreConversations = {this.handleLoadConversations}
				isLoadingConversations = {this.state.isLoadingConversations}/>
		)
	}
	
	/* User */
	
	handleUserSession(user) {
		this.setState({viewLoading: true});
		user.monkeyId = vars.userTest;
		monkey.init(vars.MONKEY_APP_ID, vars.MONKEY_APP_KEY, user, [], false, vars.MONKEY_DEBUG_MODE, false, false, (error, success) => {
			this.setState({viewLoading: false});
			if(error){
				monkey.logout();
				window.errorMsg = "Sorry, Unable to load your data. Please wait a few minutes before trying again."
			}else{
				store.dispatch(actions.addUserSession(user));	
			}
		});
	}

	handleUserSessionLogout() {
		monkey.logout();
		store.dispatch(actions.deleteUserSession());
		store.dispatch(actions.removeConversations());
	}
	
	/* Conversation */
	
	handleSortConversations(conversation1, conversation2) {
		let noLastMessage1, noLastMessage2;
		if( !conversation1.messages || Object.keys(conversation1.messages).length == 0 || !conversation1.lastMessage || conversation1.messages[conversation1.lastMessage] == null )
			noLastMessage1 = true;
			        
	    if( !conversation2.messages || Object.keys(conversation2.messages).length == 0 || !conversation2.lastMessage || conversation2.messages[conversation2.lastMessage] == null )
			noLastMessage2 = true;

		if(noLastMessage1 && noLastMessage2){
			return conversation2.lastModified - conversation1.lastModified;
	    }else if(noLastMessage2){
		    return conversation2.lastModified - Math.max(conversation1.messages[conversation1.lastMessage].datetimeCreation, conversation1.lastModified);
	    }else if(noLastMessage1){
			return Math.max(conversation2.messages[conversation2.lastMessage].datetimeCreation, conversation2.lastModified) - conversation1.lastModified;
	    }else{
			return Math.max(conversation2.messages[conversation2.lastMessage].datetimeCreation, conversation2.lastModified) - Math.max(conversation1.messages[conversation1.lastMessage].datetimeCreation, conversation1.lastModified);
		}
	}
	
	handleConversationOpened(conversation) {
		monkey.sendOpenToUser(conversation.id);
		
		if(store.getState().conversations[conversation.id] && conversation.id != conversationSelectedId && store.getState().conversations[conversation.id].unreadMessageCounter != 0){
			store.dispatch(actions.updateConversationUnreadCounter(conversation, 0));
		}
		this.setState({conversationId: conversation.id});
		conversationSelectedId = conversation.id;
		
		if(isConversationGroup(conversation.id)){
			let members = listMembers(store.getState().conversations[conversation.id].members);
			conversation['description'] = members;
			store.dispatch(actions.updateConversationStatus(conversation));
		}
	}
	
	handleConversationClosed() {
		this.setState({conversationId: 0});
		conversationSelectedId = 0;
	}
	
	handleConversationDelete(conversation, nextConversation, active, setConversationSelected) {
		monkey.deleteConversation(conversation.id, (err, data) => {
			if(!err){
				if(nextConversation){
					monkey.sendOpenToUser(nextConversation.id);
					if(active){
						this.setState({conversationId: nextConversation.id});
					}
				}else{
					if(active){
						this.setState({conversationId: undefined})
					}
				}
				store.dispatch(actions.deleteConversation(conversation));
			}
			setConversationSelected();
		});
		monkey.closeConversation(conversation.id);
	}
	
	handleConversationExit(conversation, nextConversation, active, setConversationSelected) {
		monkey.removeMemberFromGroup(conversation.id, store.getState().users.userSession.id, (err, data) => {
			if(!err){
				if(nextConversation){
					monkey.sendOpenToUser(nextConversation.id);
					if(active){
						conversationSelectedId = nextConversation.id;
						this.setState({conversationId: nextConversation.id});
					}
				}else{
					if(active){
						conversationSelectedId = 0;
						this.setState({conversationId: undefined});
					}
				}
				store.dispatch(actions.deleteConversation(conversation));
			}
			setConversationSelected();
		});
	}
	
	handleLoadConversations(timestamp){
		loadConversations(timestamp/1000);
	}
	
	handleShowConversationsLoading(value){
		this.setState({conversationsLoading: value});
	}
	
	handleConversationLoadInfo(){
		var objectInfo = {};
		var userIsAdmin = false;
		objectInfo.users = [];
		let users = store.getState().users;
		let conversations = store.getState().conversations;
		let conversation = store.getState().conversations[conversationSelectedId];


		objectInfo.name = conversation.name;
		objectInfo.avatar = conversation.urlAvatar;

		if(isConversationGroup(conversationSelectedId)){
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
			objectInfo.title = "Group Info";
			objectInfo.subTitle = "Participants";

			if(conversation.admin && conversation.admin.indexOf(users.userSession.id) > -1){
				objectInfo.actions = [
					{action : 'Delete Member', func : this.handleRemoveMember, confirm : true}, 
					{action : 'Make Admin', func : this.handleMakeMemberAdmin, confirm : true}
				]
				objectInfo.canAdd = false;
				objectInfo.renameGroup = this.handleRenameGroup;
			}
			
			objectInfo.button = {
				text : "Exit Group",
				func : this.handleConversationExitButton,
			}
			
		}else{
			objectInfo.title = "User Info";
			objectInfo.subTitle = "Conversations With " + conversation.name;
			Object.keys(conversations).forEach(key => {
				if(conversations[key].members && conversations[key].members.indexOf(conversation.id) > -1){
					objectInfo.users.push({avatar : conversations[key].urlAvatar, name : conversations[key].name, description : conversations[key].members.length + " Loaded Messages"})
				}
			})
		}
		
		return objectInfo;
	}
	
	handleRenameGroup(conversationId, newName){
		if(newName.length <= 3){
			return;
		}
		let conversation = store.getState().conversations[conversationId];
		if(!conversation){
			return;
		}
		monkey.editGroupInfo(conversation.id, {name : newName}, function(err, data){
			if(err){
				return;
			}
			console.log(data)
			store.dispatch(actions.updateConversationName(conversation, data.name));
		});
	}
	
	handleConversationExitButton(conversationId) {
		let conversations = store.getState().conversations;
		let conversation = conversations[conversationId];
		monkey.removeMemberFromGroup(conversation.id, store.getState().users.userSession.id, (err, data) => {
			if(!err){
				var nextConversationId = 0;
				var conversationArray = this.createArray(conversations);
				for(var i = 0; i < conversationArray.length; i++){
					if(conversationArray[i].id == conversation.id){
						if(conversationArray[i+1]){
							nextConversationId = conversationArray[i+1].id
						}else if(conversationArray[i-1]){
							nextConversationId = conversationArray[i-1].id
						}
						break;
					}
				}
				monkey.openConversation(conversation.id);
				this.setState({conversationId: nextConversationId});
				conversationSelectedId = nextConversationId;
				store.dispatch(actions.deleteConversation(conversation));
			}
		});
	}
	
	createArray(conversations) {
		let conversationarray = [];
		for(var x in conversations){
		  conversationarray.push(conversations[x]);
		}

		if(typeof this.options.conversationSort == "function"){
			conversationarray.sort(this.options.conversationSort);
		}
		return conversationarray;
	}
	
	handleRemoveMember(memberId, conversationId){
		monkey.removeMemberFromGroup(conversationId, memberId, null);
	}
	
	handleMakeMemberAdmin(memberId, conversationId){
		let conversation = store.getState().conversations[conversationId];
		if(!conversation || conversation.admin.indexOf(memberId) > -1){
			return;
		}
		monkey.editGroupInfo(conversationId, {admin : conversation.admin + "," + memberId}, function(err, data){
			if(err){
				return;
			}
			console.log(data)
			store.dispatch(actions.updateConversationAdmin(conversation, data.admin));
		});
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
			     	let lastOpenMe = store.getState().conversations[conversationId].lastOpenMe;
					res.map( mokMessage => {
						let message = defineBubbleMessage(mokMessage);
						if(message) {
							// define status							
							if(message.datetimeCreation <= lastOpenMe) {
								message.status = 52;
							}
							
							messages[message.id] = message;
						}
					});
					let conversation = {
						id: conversationId,
						loading: false
					}
					
					if(conversationSelectedId != conversationId){
						store.dispatch(actions.addMessages(conversation, messages, true));
					}else{
						store.dispatch(actions.addMessages(conversation, messages, false));
					}
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
		return store.getState().users[userId] ? store.getState().users[userId] : {};
	}
	
	/* Notification */
	
	handleNotifyTyping(conversationId, isTyping){
		if(!isConversationGroup(conversationId)){
			monkey.sendTemporalNotification(conversationId, {type : isTyping ? 21 : 20}, null);
		}
	}
	
/*
	conversationToSet() {
		let newConversation = dataConversation;
		store.dispatch(actions.addConversation(newConversation));
	}
*/

}

function render() {
	monkeyChatInstance = ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementById('my-chat'));
}

render();
store.subscribe(render);

// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('Connect', function(event){
	console.log('App - Connect');
	
	let user = event;
	if(!store.getState().users.userSession){
		user.id = user.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}else if(!store.getState().users.userSession.id){
		user.id = user.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		loadConversations(Date.now());
	}else{
		monkey.getPendingMessages();
	}
});

// -------------- ON DISCONNECT --------------- //
monkey.on('Disconnect', function(event){
	console.log('App - Disconnect');
	
});

// -------------- ON STATUS CHANGE --------------- //
monkey.on('StatusChange', function(data){
	console.log('App - StatusChange ' + data);

});

// --------------- ON MESSAGE ----------------- //
monkey.on('Message', function(mokMessage){
	console.log('App - onMessage');
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
		status: Number(data.status),
		recipientId: data.recipientId
	}
	store.dispatch(actions.updateMessageStatus(message, conversationId));
});

// ------- ON CONVERSATION OPEN RESPONSE ------- //
monkey.on('ConversationOpenResponse', function(data){
	console.log('App - ConversationOpenResponse');

	let conversationId = conversationSelectedId;
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
	store.dispatch(actions.updateMessagesStatus(52, conversationId, true));
});

// ------------ ON CONVERSATION OPEN ----------- //
monkey.on('ConversationOpen', function(data){
	console.log('App - ConversationOpen');
	
	let conversationId = data.senderId;
	if(!store.getState().conversations[conversationId])
		return;
		
	store.dispatch(actions.updateMessagesStatus(52, conversationId, false));
});

// -------------- ON GROUP REMOVE -------------- //
monkey.on('GroupRemove', function(data){
	console.log('App - GroupRemove');

	if(store.getState().conversations[data.id]){
		if(data.member != store.getState().users.userSession.id){
			return store.dispatch(actions.removeMember(data.member, data.id));
		}

		monkeyChatInstance.handleConversationRemove(data.id);
		
	}
});

// MonkeyChat

// MonkeyChat: Conversation

function loadConversations(timestamp) {
	if(!monkeyChatInstance.state.conversationsLoading){
		monkeyChatInstance.setState({ isLoadingConversations: true });
	}
	monkey.getConversations(timestamp, CONVERSATIONS_LOAD, function(err, resConversations){
        if(err){
            console.log(err);
            monkeyChatInstance.setState({ isLoadingConversations: false });
			monkeyChatInstance.handleShowConversationsLoading(false);
        }else if(resConversations && resConversations.length > 0){
	        let conversations = {};
	        let users = {};
	        let usersToGetInfo = {};
	        resConversations.map (conversation => {
		        if(!Object.keys(conversation.info).length){
		        	monkeyChatInstance.setState({ isLoadingConversations: false});
		        	return;
	        	}

		        // define message
		        let messages = {};
		        let messageId = null;
		        if (conversation.last_message.protocolType != 207){
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
			    	urlAvatar: conversation.info.avatar,
			    	messages: messages,
			    	lastMessage: messageId,
			    	lastModified : conversation.last_modified*1000,
			    	unreadMessageCounter: conversation.unread,
			    	description: null,
			    	loading: false,
			    	admin: conversation.info.admin
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
					        // add user into users
					        res.map(user => {
						    	userTmp = {
							    	id: user.monkey_id,
							    	name: user.name == undefined ? 'Unknown' : user.name,
							    	avatar: user.avatar
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
			        monkeyChatInstance.setState({ isLoadingConversations: false });
			        monkeyChatInstance.handleShowConversationsLoading(false);
		        });
	        }else{
		        if(Object.keys(users).length){
			        store.dispatch(actions.addUsersContact(users));
		        }
		        store.dispatch(actions.addConversations(conversations));
		        monkey.getPendingMessages();
		        monkeyChatInstance.setState({ isLoadingConversations: false });
		        monkeyChatInstance.handleShowConversationsLoading(false);
	        }
        }else{
	        monkeyChatInstance.setState({ isLoadingConversations: false });
	        monkeyChatInstance.handleShowConversationsLoading(false);
        }
    });
}

function createConversation(conversationId, mokMessage){
	if(store.getState().users[conversationId] == null){
		monkey.getInfoById(conversationId, function(err, data){
			if(err){
	            console.log(err);
	        }else if(data){
				if(isConversationGroup(conversationId)){
					store.dispatch(actions.addConversation(defineConversation(conversationId, mokMessage, data.info.name, data.info.avatar, data.members_info, data.members)));
				}else{
					store.dispatch(actions.addConversation(defineConversation(conversationId, mokMessage, data.name, data.avatar)));
				}
			}
		});
	}else{
		store.dispatch(actions.addConversation(defineConversation(conversationId, mokMessage, store.getState().users[mokMessage.senderId].name, store.getState().users[conversationId].urlAvatar)));
	}
}

function defineConversation(conversationId, mokMessage, name, urlAvatar, members_info, members){
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
    	urlAvatar: urlAvatar,
    	messages: messages,
    	lastMessage: messageId,
    	unreadMessageCounter: unreadMessageCounter,
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
		    }
		    users[userTmp.id] = userTmp;
		});
		store.dispatch(actions.addUsersContact(users));
	}else{ // define personal conversation
		conversation.lastOpenMe = undefined;
    	conversation.lastOpenApp = undefined;
    	conversation.onlineStatus = undefined;
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
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'image': { // bubble image
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 3, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'file': { // bubble file
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, message.filename, message.mimetype, 4, true, null, null);
			message.id = mokMessage.id;
			message.oldId = mokMessage.oldId;
			message.datetimeCreation = Number(mokMessage.datetimeCreation*1000);
			message.datetimeOrder = Number(mokMessage.datetimeOrder*1000);
			store.dispatch(actions.addMessage(message, message.recipientId, false));
			break;
		}
		case 'audio': { // bubble audio
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: Number(message.length)}, null);
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

	if(!store.getState().conversations[conversationId]){ // handle does not exits conversations
		createConversation(conversationId, mokMessage);
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
	if (!mokMessage.id)
		return;
		
	let message = {
    	id: mokMessage.id.toString(),
    	oldId: mokMessage.oldId,
    	datetimeCreation: Number(mokMessage.datetimeCreation*1000),
		datetimeOrder: Number(mokMessage.datetimeOrder*1000),
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
	    	}else{
		    	return undefined;
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
				let src = `data:audio/mpeg;base64,${data}`;
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

function listMembers(members){
	var list;
	if(typeof members == 'string'){
		list = members.split(',');
	}else{
		list = members;
	}
	var names = [];
	var users = store.getState().users;

	list.map(function(id) {
		if(users[id] && users[id].name){
			names.push(users[id].name);
		}
    })
	return names.join(', ');
}