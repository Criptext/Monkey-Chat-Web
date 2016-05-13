import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';
import SearchInput, {createFilter} from 'react-search-input';
import ReactDOM from 'react-dom';

const KEYS_TO_FILTERS = ['name']

class ConversationList extends Component {

	constructor(props) {
		super(props);
	    this.state = {
		    searchTerm: '',
			conversation: {id: -1},
			conversationArray: undefined
		}
	    this.searchUpdated = this.searchUpdated.bind(this);
	    this.conversationIdSelected = this.conversationIdSelected.bind(this);
	    this.domNode;
	}
	
	componentWillMount() {
		this.setState({conversationArray: this.createArray(this.props.conversations)});
	}
	
	componentWillReceiveProps(nextProps) {
		this.setState({conversationArray: this.createArray(nextProps.conversations)});
	}
	
	render() {
		const conversationNameFiltered = this.state.conversationArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
    	return (
    		<div className='mky-session-conversations'>
	    		<SearchInput className='search-input' onChange={this.searchUpdated} />
	    		<ul ref='conversationList' id='mky-conversation-list'>
				{conversationNameFiltered.map(conversation => {
	    			return (
						<ConversationItem key={conversation.id} conversation={conversation} conversationIdSelected={this.conversationIdSelected} selected={this.state.conversation.id === conversation.id}/>
					)
				})}
				</ul>
			</div>
		)
	}

	componentDidUpdate() {
		this.scrollToFirstChildWhenItsNecessary();
	}

	componentDidMount() {
		this.domNode = ReactDOM.findDOMNode(this.refs.conversationList);
	}
	
	conversationIdSelected(conversationId) {
		this.setState({conversation: this.props.conversations[conversationId]});
		this.props.conversationSelected(this.props.conversations[conversationId]);
	}

	searchUpdated(term) {
    	this.setState({searchTerm: term});
  	}
  	
  	createArray(conversations){
  		let conversationarray = [];
		for(var x in conversations){
		  conversationarray.push(conversations[x]);
		}

		conversationarray.sort(function(a, b) {
	        if(a.messages.length == 0)
	        	return 1;
	        return b.messages[b.lastMessage].datetimeOrder - a.messages[a.lastMessage].datetimeOrder;
	    });

		return conversationarray;
  	}

  	scrollToFirstChildWhenItsNecessary(){
		if(this.domNode!=null && this.domNode.children.length > 0 
			&& this.state.conversation.id == this.state.conversationArray[0].id){
			this.domNode.firstChild.scrollIntoView();
		}
  	}
}

export default ConversationList;