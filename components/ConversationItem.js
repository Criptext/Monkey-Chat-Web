import React, { Component } from 'react'

class ConversationItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			unreadMessages: false
		}
		this.openConversation = this.openConversation.bind(this);
		this.deleteConversation = this.deleteConversation.bind(this);
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
			<li className={classContent}>
				<div className="mky-full" onClick={this.openConversation}>
					<div className='mky-conversation-image'><img src={this.props.conversation.urlAvatar} onerror='imgError(this);'/></div>
					<div className='mky-conversation-description'>
						<div className='mky-conversation-name'>
							{ this.state.unreadMessages
								? <span className='mky-ellipsify mky-bold-text'>{this.props.conversation.name}</span>
								: <span className='mky-ellipsify'>{this.props.conversation.name}</span>
							}
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
				<Badge value={this.props.conversation.unreadMessageCounter}/>
			</li>
		);
	}
	
	openConversation(){
		this.props.conversationIdSelected(this.props.conversation.id);
	}

	deleteConversation(){
		this.props.deleteConversation(this.props.conversation)
	}
}

const Badge = (props) => (
	<div className="mky-conversation-notification">
	{
		props.value > 0 
		? <div className="mky-notification-amount">{props.value}</div>
		: null
	}
	</div>
);

export default ConversationItem;