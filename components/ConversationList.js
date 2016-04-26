import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';
import SearchInput, {createFilter} from 'react-search-input';

const KEYS_TO_FILTERS = ['name']

class ConversationList extends Component {

	constructor(props) {
		super(props);
	    this.state = {
		    searchTerm: '',
			conversation: {id: -1}
		}
	    this.searchUpdated = this.searchUpdated.bind(this);
	    this.conversationSelected = this.conversationSelected.bind(this);
	    this.conversationName;
	}
	
	componentWillMount() {
		this.conversationName = this.createArray();
	}

	render() {
		const conversationNameFiltered = this.conversationName.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
    	return (
    		<div>
	    		<SearchInput className="search-input" onChange={this.searchUpdated} />
	    		<div id='mky-conversation-list'>
				{conversationNameFiltered.map(conversation => {
	    			return (
						<ConversationItem key={conversation.id} conversation={conversation} conversationSelected={this.conversationSelected} selected={this.state.conversation.id === conversation.id}/>
					)
				})}
				</div>
			</div>
		)
	}
	
	conversationSelected(conversation) {
		this.setState({conversation: conversation});
		this.props.conversationSelected(conversation);
	}

	searchUpdated(term) {
    	this.setState({searchTerm: term});
  	}
  	
  	createArray(){
  		let conversationarray = [];
		for(var x in this.props.conversations){
		  conversationarray.push(this.props.conversations[x]);
		}
		return conversationarray;
  	}
}

export default ConversationList;