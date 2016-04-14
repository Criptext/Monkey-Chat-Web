import React, { Component } from 'react'
import ConversationWindow from './ConversationWindow.js';
import Bubble from './Bubble.js';
import BubbleText from './BubbleText.js';
import BubbleImage from './BubbleImage.js';
import BubbleFile from './BubbleFile.js';
import BubbleAudio from './BubbleAudio.js';

const BubbleText_ = Bubble(BubbleText);
const BubbleImage_ = Bubble(BubbleImage);
const BubbleFile_ = Bubble(BubbleFile);
const BubbleAudio_ = Bubble(BubbleAudio);

const TimelineChat = ({ conversationSelected, userSessionId }) => (
	<div id='mky-chat-timeline'>
		{typeof conversationSelected !== 'undefined' ? Object.keys(conversationSelected.messages).map( key => {
			const message = conversationSelected.messages[key];
			switch(message.type){
				case 1:
					return <BubbleText_ key={message.id} message={message} userSessionId={userSessionId} layerClass={'text'} />
					break;
				case 2:
					return <BubbleImage_ key={message.id} message={message} userSessionId={userSessionId} layerClass={'image'} />
					break;
				case 3:
					return <BubbleFile_ key={message.id} message={message} userSessionId={userSessionId} layerClass={'file'} />
					break;
				case 4:
					return <BubbleAudio_ key={message.id} message={message} userSessionId={userSessionId} layerClass={'audio'} />
					break;
			}
			
		}) : null}
	</div>
);

export default TimelineChat;