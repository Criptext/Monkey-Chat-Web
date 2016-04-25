import React, { Component } from 'react'
import Bubble from './Bubble.js';
import BubbleText from './BubbleText.js';
import BubbleImage from './BubbleImage.js';
import BubbleFile from './BubbleFile.js';
import BubbleAudio from './BubbleAudio.js';
import BubbleLocation from './BubbleLocation.js';

const BubbleText_ = Bubble(BubbleText);
const BubbleImage_ = Bubble(BubbleImage);
const BubbleFile_ = Bubble(BubbleFile);
const BubbleAudio_ = Bubble(BubbleAudio);
const BubbleLocation_ = Bubble(BubbleLocation);

const TimelineChat = (props, context) => (
	<div id='mky-chat-timeline'>
		{typeof props.conversationSelected !== 'undefined' ? Object.keys(props.conversationSelected.messages).map( key => {
			const message = props.conversationSelected.messages[key];
			switch(message.type){
				case 1:
					return <BubbleText_ key={message.id} message={message} userSessionId={context.userSession.id} layerClass={'text'} />
					break;
				case 2:
					return <BubbleImage_ key={message.id} message={message} userSessionId={context.userSession.id} layerClass={'image'} />
					break;
				case 3:
					return <BubbleFile_ key={message.id} message={message} userSessionId={context.userSession.id} layerClass={'file'} />
					break;
				case 4:
					return <BubbleAudio_ key={message.id} message={message} userSessionId={context.userSession.id} layerClass={'audio'} />
					break;
				case 5:
					return <BubbleLocation_ key={message.id} message={message} userSessionId={context.userSession.id} layerClass={'location'} />
					break;
			}
			
		}) : null}
	</div>
);

TimelineChat.contextTypes = {
    userSession: React.PropTypes.object.isRequired
}

export default TimelineChat;