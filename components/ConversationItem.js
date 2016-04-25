import React, { Component } from 'react'

class ConversationItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			unreadMessageCount: this.props.conversation.unreadMessageCount
		}
		this.openConversation = this.openConversation.bind(this);
	}

	render() {
		let classContent = this.props.selected ? 'mky-conversation-selected' : 'mky-conversation-unselected';
    	return (
			<li className={classContent} onClick={this.openConversation}>
				<div className='mky-conversation-image'><img src={this.props.conversation.urlAvatar} onerror='imgError(this);'/></div>
				<div className='mky-conversation-description'>
					<div className='mky-conversation-name'><span className='mky-ellipsify'>{this.props.conversation.name}</span></div>
					<div className="mky-conversation-state"><span className="mky-ellipsify">Last message</span></div>
				</div>
				<Badge value={this.state.unreadMessageCount}/>
			</li>
		);
	}
	
	openConversation(){
		this.props.conversationSelected(this.props.conversation);
		this.setState({unreadMessageCount: 0});
	}
	
}

const Badge = ({value}) => (
	<div className="mky-conversation-notification">
	{
		value !== 0
		? <div className="mky-notification-amount">{value}</div>
		: null
	}
	</div>
);

export default ConversationItem;