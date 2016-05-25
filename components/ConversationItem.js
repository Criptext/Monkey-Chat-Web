import React, { Component } from 'react'
import ModalGeneric from './ModalGeneric.js'
import { defineTime, defineTimeByToday } from '../utils/monkey-utils.js'

class ConversationItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			unreadMessages: false
		}
		this.openConversation = this.openConversation.bind(this);
		this.deleteConversation = this.deleteConversation.bind(this);
		this.showNotification = this.showNotification.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.conversation.unreadMessageCounter > 0){
			this.setState({unreadMessages: true});
		}else{
			this.setState({unreadMessages: false});
		}
	}

	render() {
			let classContent = this.props.selected ? 'mky-conversation-selected' : 'mky-conversation-unselected';
    	return (
			<li className={classContent + ' animated slideInLeft'}>
				<div className="mky-full" onClick={this.openConversation}>
					<div className='mky-conversation-image'><img src={this.props.conversation.urlAvatar} onerror='imgError(this);'/></div>
					<div className='mky-conversation-description'>
						<div className='mky-conversation-title'>
							<div className='mky-conversation-name'>
								{ this.state.unreadMessages
									? <span className='mky-ellipsify mky-bold-text'>{this.props.conversation.name}</span>
									: <span className='mky-ellipsify'>{this.props.conversation.name}</span>
								}
							</div>
							<div className='mky-conversation-time'>
								<span className=''>{this.props.conversation.messages[this.props.conversation.lastMessage] ? defineTimeByToday(this.props.conversation.messages[this.props.conversation.lastMessage].datetimeCreation) : ''}</span>
							</div>
						</div>
						<div className="mky-conversation-state">
							{ this.props.conversation.messages
								? ( this.state.unreadMessages
									? <span className="mky-ellipsify mky-bold-text">{this.props.conversation.messages[this.props.conversation.lastMessage] ? this.props.conversation.messages[this.props.conversation.lastMessage].preview : ''}</span>
									: <span className="mky-ellipsify">{this.props.conversation.messages[this.props.conversation.lastMessage] ? this.props.conversation.messages[this.props.conversation.lastMessage].preview : ''}</span>
								)
								: <span className="mky-ellipsify">Click to open conversation</span>
							}
						</div>
					</div>
				</div>
				<div className="mky-delete-convv" onClick={this.deleteConversation}></div>
				<Badge value={this.props.conversation.unreadMessageCounter} />
				{
					this.props.conversation.unreadMessageCounter > 0 ?
						this.showNotification(this.props.conversation.name , this.props.conversation.messages[this.props.conversation.lastMessage].preview, this.props.conversation.urlAvatar )
					:null
				}
			</li>
		);
	}

	openConversation(){
		this.props.conversationIdSelected(this.props.conversation.id);
	}

	deleteConversation(){
		if(this.props.selected){
			this.props.deleteConversation(this.props.conversation, this.props.index, true)
		}else{
			this.props.deleteConversation(this.props.conversation, this.props.index, false)
		}
	}

	showNotification(name, message, user_image ) {
			console.log('has to show a new notification');
			console.log(name);
			console.log(message);
			console.log(user_image);
      var title = name;
      var desc = message;
      var url = 'http://criptext.com/';
      var imageURL = user_image;
      if (imageURL == '') {
          imageURL = "http://cdn.criptext.com/MonkeyUI/images/userdefault.png";
      }
      // NOTIFICATION
      if (!Notification) {
          console.log('Desktop notifications not available in your browser..');
          return;
      }
      if (Notification.permission !== "granted") {
					console.log('requestPermission');
          Notification.requestPermission();
      } else {
					console.log('crear notification');
          // Create Notification
          var notification = new Notification(title, {
              icon: imageURL,
              body: desc,
          });
          // Remove the notification from Notification Center when clicked.
          notification.onclick = function() {
              window.open(url);
          };
          // Callback function when the notification is closed.
          notification.onclose = function() {
              console.log('Notification closed');
          };
      }
  }
}

const Badge = (props , showNotification) => (
	<div className="mky-conversation-notification">
	{
		props.value > 0
		? <div className="mky-notification-amount animated pulse">{props.value}</div>
		: null
	}
	</div>
);

export default ConversationItem;
