import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MonkeyUI from 'react-monkey-ui'
import Monkey from 'monkey-sdk'
import { isConversationGroup } from './../../../utils/monkey-utils.js'
import * as vars from './../../../utils/monkey-const.js'

import { createStore } from 'redux'
import reducer from './../../../reducers'
import * as actions from './../../../actions'

const monkey = new Monkey ();
const store = createStore(reducer, { conversations: {}, users: { userSession:monkey.getUser() } });
const colorUsers = ["#6f067b","#00a49e","#b3007c","#b4d800","#e20068","#00b2eb","#ec870e","#84b0b9","#3a6a74","#bda700","#826aa9","#af402a","#733610","#020dd8","#7e6565","#cd7967","#fd78a7","#009f62","#336633","#e99c7a","#000000"];
var conversationSelectedId = 0;

class MonkeyChat extends Component {
	constructor(props){
		super(props);
		this.state = {
			conversationId: undefined,
			viewLoading: false
		}

		this.view = {
			type: 'fullscreen'
		}
		
		this.options = {
			deleteConversation: {
				permission: {
					exitGroup: true,
					delete: true
				}
			}
		}
		
		this.handleUserSession = this.handleUserSession.bind(this);
		this.handleUserSessionLogout = this.handleUserSessionLogout.bind(this);
		this.handleConversationOpened = this.handleConversationOpened.bind(this);
		this.handleConversationDelete = this.handleConversationDelete.bind(this);
		this.handleConversationExit = this.handleConversationExit.bind(this);
		this.handleMessagesLoad = this.handleMessagesLoad.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
		this.handleMessageDownloadData = this.handleMessageDownloadData.bind(this);
		this.handleMessageGetUser = this.handleMessageGetUser.bind(this);
	}

	componentWillMount() {
		if(monkey.getUser() != null){
			this.setState({viewLoading: true});
			var user = monkey.getUser();
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
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.store.users.userSession && this.state.loading){ // handle stop loading when found user session
			this.setState({viewLoading: false});
		}
	}
	
	render() {
		return (
			<MonkeyUI view={this.view}
				options={this.options}
				viewLoading={this.state.viewLoading}
				userSession={this.props.store.users.userSession}
				onUserSession={this.handleUserSession}
				onUserSessionLogout={this.handleUserSessionLogout}
				conversations={this.props.store.conversations}
				conversation={this.props.store.conversations[this.state.conversationId]}
				onConversationOpened={this.handleConversationOpened}
				onConversationDelete={this.handleConversationDelete}
				onConversationExit={this.handleConversationExit}
				onMessagesLoad={this.handleMessagesLoad}
				onMessage={this.handleMessage}
				onMessageDownloadData={this.handleMessageDownloadData}
				onMessageGetUser={this.handleMessageGetUser}/>
		)
	}
	
	/* User */
	
	// user.monkeyId = 'if9ynf7looscygpvakhxs9k9';
	// user.monkeyId = 'imvie0trlgpl8ug5a9oirudi';
	// user.monkeyId = 'idkh61jqs9ia151u7edhd7vi';
	handleUserSession(user) {
		this.setState({viewLoading: true});
		user.monkeyId = 'if9ynf7looscygpvakhxs9k9';
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
	
	handleConversationOpened(conversation) {
		monkey.sendOpenToUser(conversation.id);
		
		if(store.getState().conversations[conversation.id] && conversation.id != conversationSelectedId && store.getState().conversations[conversation.id].unreadMessageCounter != 0){
			store.dispatch(actions.updateConversationUnreadCounter(conversation, 0));
		}
		this.setState({conversationId : conversation.id});
		conversationSelectedId = conversation.id;
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
	}
	
	handleConversationExit() {
		monkey.removeMemberFromGroup(conversation.id, store.getState().users.userSession.id, (err, data) => {
			if(!err){
				if(nextConversation){
					monkey.sendOpenToUser(nextConversation.id);
					if(active){
						this.setState({conversationId: nextConversation.id});
					}
				}else{
					if(active){
						this.setState({conversationId : undefined});
					}
				}
				store.dispatch(actions.deleteConversation(conversation));
			}
			setConversationSelected();
		});
	}
	
	/* Message */
	
	handleMessage(message) {
		createMessage(message);
	}
	
	handleMessagesLoad(conversationId, firstMessageId) {
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
					if(conversationSelectedId != conversationId){
						store.dispatch(actions.addMessages(messages, conversationId, true));
					}else{
						store.dispatch(actions.addMessages(messages, conversationId, false));
					}
		        }
			}
		});
	}

	handleMessageDownloadData(mokMessage){
		toDownloadMessageData(mokMessage);
	}

	handleMessageGetUser(userId){
		return store.getState().users[userId];
	}
}

function render() {
	ReactDOM.render(<MonkeyChat store={store.getState()}/>, document.getElementById('my-chat'));
}

render();
store.subscribe(render);

// MonkeyKit

// --------------- ON CONNECT ----------------- //
monkey.on('Connect', function(event){
	console.log('App - Connect');
	
	let user = event;
	if(!store.getState().users.userSession){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}else if(!store.getState().users.userSession.id){
		user.id = event.monkeyId;
		store.dispatch(actions.addUserSession(user));
	}
	if(!Object.keys(store.getState().conversations).length){
		loadConversations();
	}
});

// -------------- ON DISCONNECT --------------- //
monkey.on('onDisconnect', function(event){
	console.log('App - Disconnect');
	
});

// --------------- ON MESSAGE ----------------- //
monkey.on('Message', function(mokMessage){
	console.log('App - Message');
	defineMessage(mokMessage);
});

// ------------- ON NOTIFICATION --------------- //
monkey.on('Notification', function(mokMessage){
	console.log('App - Notification');
	
	let notType = mokMessage.protocolCommand;
	let conversationId = mokMessage.senderId;
	switch (notType){
		case 200:{ // message
			var proType = mokMessage.protocolType;
			if(proType == 3){ // Temporal Notification
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
        case 207:{ // unsend message
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

monkey.on('ConversationOpen', function(data){
	let conversationId = data.senderId;
	store.dispatch(actions.updateMessagesStatus(52, conversationId, false));
});

// --------------- GROUP DELETE MEMBER ----------------- //
monkey.on('GroupRemove', function(data){
	console.log('App - GroupRemove');

	if(store.getState().conversations[data.id]){
		store.dispatch(actions.removeMember(data.member, data.id));
	}
});

// MonkeyChat

// MonkeyChat: Conversation

function loadConversations() {
	monkey.getAllConversations(function(err, res){
        if(err){
            console.log(err);
        }else if(res && res.data.conversations.length > 0){
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
		store.dispatch(actions.addConversation(defineConversation(conversationId, mokMessage, store.getState().users[mokMessage.senderId].name, store.getState().users[mokMessage.senderId].urlAvatar)));
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
			let mokMessage = monkey.sendEncryptedFile(message.data, message.recipientId, 'audioTmp.mp3', message.mimetype, 1, true, {length: Number(message.length) }, null);
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
	if(!conversation){ // handle does not exits conversations
		createConversation(conversationId, mokMessage);
		return;
	}
	
	let message = defineBubbleMessage(mokMessage);

	if(message){
		// define status	
		if( message.datetimeCreation <= store.getState().conversations[conversationId].lastOpenMe ){
			message.status = 52;
		}
		
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
	var list = [];
		this.props.conversationSelected.members.map(function(member) {
			list.push(member.name);
        })
	return list.join(', ');
}