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
		this.loadingMessages = 0;
		this.handleScroll = this.handleScroll.bind(this);
		this.updateScrollTop = this.updateScrollTop.bind(this);
		this.state = {
			update: 0
		}
		this.domNode;
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.conversationSelected.lastMessage) {
			if(nextProps.conversationSelected.messages[nextProps.conversationSelected.lastMessage] && nextProps.conversationSelected.messages[nextProps.conversationSelected.lastMessage].senderId === this.context.userSession.id){
				this.goBottom = true;
			}
		}
		if(this.props.conversationSelected.id != nextProps.conversationSelected.id){
			this.scrollTop = 0;
			this.loadingMessages = 0;
		}
		this.orderedConversations = this.sortObject(nextProps.conversationSelected.messages);
		if(Object.keys(nextProps.conversationSelected.messages).length != Object.keys(this.props.conversationSelected.messages).length && nextProps.conversationSelected.lastMessage == this.props.conversationSelected.lastMessage && this.props.conversationSelected.id == nextProps.conversationSelected.id){
			this.loadingMessages = 1;
		}
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
					const Bubble_ = Bubble(this.context.bubbles[message.bubbleType]);
					return <Bubble_ key={message.id} message={message} userSessionId={this.context.userSession.id} layerClass={message.bubbleType} messageSelected={this.props.messageSelected} onClickMessage={this.props.onClickMessage} dataDownloadRequest={this.props.dataDownloadRequest} getUserName={this.props.getUserName}/>
				})
				: null}
		</div>)
	}

	componentDidMount() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		//this.domNode.lastChild.scrollIntoView();
	    this.domNode.addEventListener('scroll', this.handleScroll);
	}

	componentDidUpdate() {
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);
		if(!this.loadingMessages && this.domNode.lastChild!=null){
 			this.domNode.lastChild.scrollIntoView();
 		}
 		this.updateScrollTop();
 		if(this.scrollHeight != this.domNode.scrollHeight && this.loadingMessages){
 			this.domNode.scrollTop += this.domNode.scrollHeight - this.scrollHeight;
 			this.scrollHeight = this.domNode.scrollHeight;
 			this.loadingMessages = 0;
 		}
	}
	
	updateScrollTop(){
		this.domNode = ReactDOM.findDOMNode(this.refs.timelineChat);

		if(!this.goBottom && this.domNode.scrollTop != 0){
			this.scrollTop = this.domNode.scrollTop;
			return;
		}
		
		if (this.goBottom){
			this.goBottom = false;
// 			this.domNode.lastChild.scrollIntoView();
			
		}else if(this.domNode.scrollTop === 0 && this.scrollTop != 0){
			this.scrollHeight = this.domNode.scrollHeight;
			this.props.loadMessages(this.props.conversationSelected.id, this.props.conversationSelected.messages[this.orderedConversations[0].key].datetimeCreation/1000);
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
    bubbles: React.PropTypes.object.isRequired,
}

export default TimelineChat;