import React, { Component } from 'react'
import ConversationWindow from './ConversationWindow.js';

class Timeline extends Component {
	render() {
    	return (
			<div id='mky-chat-timeline'>
				{
					this.props.conversationList.map( conversation => {
						var classState = '';
						if(this.props.conversationSelected == undefined){
							classState = 'mky-disappear';
						}else if(this.props.conversationSelected.id == conversation.id){
							classState = 'mky-appear';
						}else{
							classState = 'mky-disappear';
						}
						return <ConversationWindow key={conversation.id} conversation={conversation} classState={classState}/>
					})
				}
			</div>
		);
  	}
}

export default Timeline;