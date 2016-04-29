import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';
import SearchInput, {createFilter} from 'react-search-input';

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
    		<div>
	    		<SearchInput className="search-input" onChange={this.searchUpdated} />
	    		<div id='mky-conversation-list'>
				{conversationNameFiltered.map(conversation => {
	    			return (
						<ConversationItem key={conversation.id} conversation={conversation} conversationIdSelected={this.conversationIdSelected} selected={this.state.conversation.id === conversation.id}/>
					)
				})}
				</div>
			</div>
		)
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
		return conversationarray;
  	}
}

export default ConversationList;