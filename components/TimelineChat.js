import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Bubble from './Bubble.js';

class TimelineChat extends Component {

	constructor(props, context) {
		super(props, context);
		this.orderedConversations = [];
		this.goBottom = false;
		this.scrollTop = 0;
		this.scrollHeight = 0;
		this.handleScroll = this.handleScroll.bind(this);
		this.updateScrollTop = this.updateScrollTop.bind(this);
		this.state = {
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
		this.orderedConversations = this.sortObject(nextProps.conversationSelected.messages);
	}
	
	componentWillMount() {
		if(this.props.conversationSelected.unreadMessageCount === 0){
			this.goBottom = true;
		}
		this.orderedConversations = this.sortObject(this.props.conversationSelected.messages);
	}
	
	componentWillUpdate() {
		
	}

	render(){
		return( <div ref="timelineChat" id='mky-chat-timeline'>
			{ Object.keys(this.props.conversationSelected).length
				? this.orderedConversations.map( item => {
					const message = this.props.conversationSelected.messages[item.key];
					const Bubble_ = Bubble(this.context[message.bubbleType]);
					return <Bubble_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={message.bubbleType} messageSelected={this.props.messageSelected}/>
				})
				: null}
		</div>)
	}

	componentDidMount() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		//this.domNode.lastChild.scrollIntoView();
	    this.domNode.addEventListener('scroll', this.handleScroll);
	    console.log('hi');
	}

	componentDidUpdate() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		//this.domNode.lastChild.scrollIntoView();
 		this.updateScrollTop();
 		console.log('height : ' + this.domNode.scrollHeight + " VS " + this.scrollHeight);
 		if(this.scrollHeight != this.domNode.scrollHeight){
 			this.domNode.scrollTop = this.domNode.scrollHeight - this.scrollHeight;
 		}
	}
	
	updateScrollTop(){
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);

		if(!this.goBottom && this.domNode.scrollTop != 0){
			this.scrollTop = this.domNode.scrollTop;
			console.log('stop');
			return;
		}
		
		if (this.goBottom){
			this.goBottom = false;
// 			this.domNode.lastChild.scrollIntoView();
			
		}else if(this.domNode.scrollTop === 0 && this.scrollTop != 0){
			console.log('load here!');
			this.scrollHeight = this.domNode.scrollHeight;
			this.props.loadMessages(this.props.conversationSelected, this.orderedConversations[1].key);
		}	
		this.scrollTop = this.domNode.scrollTop;
	}

	handleScroll(event) {
		this.updateScrollTop();
	}

	sortObject(obj) {
    	var arr = [];
	    var prop;
	    Object.keys(obj).map(function(key, index) {
	    	arr.push({
                'key': key,
                'date': obj[key].datetimeOrder
            });
        });
	    arr.sort(function(a, b) {
	        return a.date - b.date;
	    });
	    return arr;
	}
}

TimelineChat.contextTypes = {
    userSession: React.PropTypes.object.isRequired,
    text: React.PropTypes.any.isRequired,
    image: React.PropTypes.any.isRequired,
    file: React.PropTypes.any.isRequired,
    audio: React.PropTypes.any.isRequired,
    location: React.PropTypes.any.isRequired,
}

export default TimelineChat;