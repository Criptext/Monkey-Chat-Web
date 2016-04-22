import React, { Component } from 'react'
import ContentIntro from './ContentIntro.js';
import ContentConversation from './ContentConversation.js';

class ContentWindow extends Component {
	constructor(props){
		super(props);
		this.classExpand = 'mky-content-window-with';
		this.classStateWindow = '';
	}
	
	componentWillMount() {
		if(this.props.expandWindow){
			this.classExpand = 'mky-content-window-only';
		}
	}
	
	render() {
		if(this.props.conversationSelected != undefined){
			this.classStateWindow = '';
		}else{
			this.classStateWindow = 'mky-disabled';
		}
		
    	return (
	    	<section className={this.classExpand+' '+this.classStateWindow}>
	    	{
		    	this.props.conversationSelected
		    	? <ContentConversation conversationSelected={this.props.conversationSelected} userSessionId={this.props.userSessionId} messageCreated={this.props.messageCreated}/>
		    	: <ContentIntro />
	    	}
			</section>
		);
	}
}

export default ContentWindow;