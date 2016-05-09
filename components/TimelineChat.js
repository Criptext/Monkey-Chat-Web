import React, { Component } from 'react'
import ReactDOM from 'react-dom';

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

class TimelineChat extends Component {

	constructor(props, context) {
		super(props);
		context.userSession;
		this.goBottom = false;
		this.handleScroll = this.handleScroll.bind(this);
		this.updateScrollTop = this.updateScrollTop.bind(this);
		this.state = {
			scrollTop : 0,
			update: 0
		}
		this.domNode;
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.conversationSelected.lastMessage) {
			if(nextProps.conversationSelected.messages[nextProps.conversationSelected.lastMessage].senderId === this.context.userSession.id){
				this.goBottom = true;
			}
		}	
	}
	
	componentWillMount() {
		if(this.props.conversationSelected.unreadMessageCount === 0){
			this.goBottom = true;
		}
	}
	
	render(){
		return( <div ref="timelineChat" id='mky-chat-timeline'>
			{ Object.keys(this.props.conversationSelected).length
				? Object.keys(this.props.conversationSelected.messages).map( key => {
					const message = this.props.conversationSelected.messages[key];
					switch(message.type){
						case 1:
							return <BubbleText_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'text'} />
						case 2:
							return <BubbleImage_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'image'} messageSelected={this.props.messageSelected}/>
						case 3:
							return <BubbleFile_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'file'} />
						case 4:
							return <BubbleAudio_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'audio'} />
						case 5:
							return <BubbleLocation_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'location'} messageSelected={this.props.messageSelected}/>
						default:
							break;
					}
				})
				: null}
		</div>)
	}

	componentDidMount() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		this.domNode.lastChild.scrollIntoView();
	    this.domNode.addEventListener('scroll', this.handleScroll);
	}

	componentDidUpdate() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		this.domNode.lastChild.scrollIntoView();
 		this.updateScrollTop();
	}
	
	updateScrollTop(){
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);

		if(!this.goBottom && this.domNode.scrollTop != 0){
			console.log('stop');
			return;
		}
		
		if (this.goBottom){
			this.goBottom = false;
// 			this.domNode.lastChild.scrollIntoView();
			
		}else if(this.domNode.scrollTop === 0){
			console.log('load here!');
		}	
	}

	handleScroll(event) {
		this.updateScrollTop();
	}
}

TimelineChat.contextTypes = {
    userSession: React.PropTypes.object.isRequired
}

export default TimelineChat;