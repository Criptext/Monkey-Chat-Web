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
		this.mounted = false;
		this.handleScroll = this.handleScroll.bind(this);
		this.updateScrollTop = this.updateScrollTop.bind(this);
		this.state = {
			scrollTop : 0,
			update: 0
		}
	}

	componentWillReceiveProps(nextProps) {
		var domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		if(this.props.conversationSelected != nextProps.conversationSelected){
			this.mounted = false;
		}else if(!this.goBottom){
			var keys = Object.keys(this.props.conversationSelected.messages);
			var key = keys[keys.length - 1];
			var message = this.props.conversationSelected.messages[key];
			if (message.senderId == this.context.userSession.id){
				this.goBottom = true;
			}
		}
	}

	render(){
		return( <div ref="timelineChat" id='mky-chat-timeline'>
			{typeof this.props.conversationSelected !== 'undefined' ? Object.keys(this.props.conversationSelected.messages).map( key => {
				const message = this.props.conversationSelected.messages[key];
				switch(message.type){
					case 1:
						return <BubbleText_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'text'} />
						break;
					case 2:
						return <BubbleImage_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'image'} messageSelected={this.props.messageSelected}/>
						break;
					case 3:
						return <BubbleFile_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'file'} />
						break;
					case 4:
						return <BubbleAudio_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'audio'} />
						break;
					case 5:
						return <BubbleLocation_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={'location'} />
						break;
				}
				
			}) : null}
		</div>)
	}

	componentDidMount() {
		var domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		domNode.lastChild.scrollIntoView();
	    domNode.addEventListener('scroll', this.handleScroll);
	}

	updateScrollTop(){
		var domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		$(domNode).focus();
		if(!this.mounted){
			this.mounted = true;
			this.goBottom = true;
			this.setState({
				scrollTop : 0 
			});
		}else if (this.goBottom){
			this.goBottom = false;
			console.log("did update : " + domNode.scrollHeight);
			domNode.lastChild.scrollIntoView();
		}else if(this.state.scrollTop != domNode.scrollTop){
			this.setState({
				scrollTop : domNode.scrollTop
			});
			if(domNode.scrollTop==0 && this.mounted){
				console.log('load here!');
			}
		}

	}

	componentDidUpdate() {
		this.updateScrollTop();
	}

	handleScroll(event) {
		this.updateScrollTop();
	}
}

TimelineChat.contextTypes = {
    userSession: React.PropTypes.object.isRequired
}

export default TimelineChat;