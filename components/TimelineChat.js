import React, { Component } from 'react'
// import ConversationWindow from './ConversationWindow.js';
import Bubble from './Bubble.js';
import BubbleText from './BubbleText.js';
import BubbleImage from './BubbleImage.js';
import BubbleFile from './BubbleFile.js';
import BubbleAudio from './BubbleAudio.js';
// import InfiniteScroll from 'react-infinite-scroll';

const BubbleText_ = Bubble(BubbleText);
const BubbleImage_ = Bubble(BubbleImage);
const BubbleFile_ = Bubble(BubbleFile);
const BubbleAudio_ = Bubble(BubbleAudio);

var InfiniteScroll = require('react-infinite-scroll')(React);

var VisibilitySensor = require('react-visibility-sensor');

var onChange = function (isVisible) {
	console.log('Element is now %s', isVisible ? 'visible' : 'hidden');

	if (isVisible) {

	} else {

	}
};


class TimelineChat extends Component {

	constructor(props){
		super(props);
		this.createDiv = this.createDiv.bind(this);
		this.state = {
			hasMore: true,
      		items: [this.createDiv(0)],

		}
		this.loadMore = this.loadMore.bind(this);
	}

	render(){
		console.log('something');
		return (
			<div id='mky-chat-timeline'>
				<VisibilitySensor onChange={onChange} />

				<InfiniteScroll loader={<div className="loader">Loading ...</div>} loadMore={this.loadMore} hasMore={this.state.hasMore}>
			        {this.state.items}
			    </InfiniteScroll >
				

				{typeof this.props.conversationSelected !== 'undefined' ? Object.keys(this.props.conversationSelected.messages).map( key => {
					const message = this.props.conversationSelected.messages[key];
					switch(message.type){
						case 1:
							return <BubbleText_ key={message.id} message={message} userSessionId={this.props.userSessionId} layerClass={'text'} />
							break;
						case 2:
							return <BubbleImage_ key={message.id} message={message} userSessionId={this.props.userSessionId} layerClass={'image'} />
							break;
						case 3:
							return <BubbleFile_ key={message.id} message={message} userSessionId={this.props.userSessionId} layerClass={'file'} />
							break;
						case 4:
							return <BubbleAudio_ key={message.id} message={message} userSessionId={this.props.userSessionId} layerClass={'audio'} />
							break;
					}
					
				}) : null}
			</div>
		);
	}

	loadMore(page) {
		console.log('load');
		this.setState({
			items: this.state.items.concat([this.createDiv(page)]),
			hasMore: (page < 4)
		});
	}

	createDiv(page) {
		return ( < div key={page} className = "samplePage" > {
	        'Hello page ' + page + ' !'
	    } < /div>
	  );
	}

}

function createDiv(page) {
	    
	};


export default TimelineChat;