import React, { Component } from 'react'
import ContentIntro from './ContentIntro.js';
import ContentConversation from './ContentConversation.js';

class ContentWindow extends Component {
	constructor(props){
		super(props);
		this.classExpand = 'mky-content-window-with';
		this.classStateWindow = 'mky-disabled';
	}
	
	componentWillMount() {
		if(this.props.expandWindow){
			this.classExpand = 'mky-content-window-only';
		}
	}
	
	render() {
		if(this.props.conversationSelected != undefined){
			this.classStateWindow = '';
		}

    	return (
	    	<section className={this.classExpand+' '+this.classStateWindow}>
	    	{
		    	this.props.conversationSelected
		    	? <ContentConversation loadMessages={this.props.loadMessages} conversationSelected={this.props.conversationSelected} messageCreated={this.props.messageCreated}/>
		    	: <ContentIntro />
	    	}
			</section>
		);
	}
}

export default ContentWindow;