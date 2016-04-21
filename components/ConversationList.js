import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';
import SearchInput, {createFilter} from 'react-search-input';

const KEYS_TO_FILTERS = ['name']

class ConversationList extends Component {

	constructor(props) {
		super(props);
	    this.state = { searchTerm: '' }
	    this.searchUpdated = this.searchUpdated.bind(this);
	}

	render() {

		const conversation_list = this.createArray();

		const filteredEmails = conversation_list.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));

    	return (
    		<div>
	    		<SearchInput className="search-input" onChange={this.searchUpdated} />
	    		<div id='mky-conversation-list'>
				{filteredEmails.map(conversation => {
	    			return (
						
							
								<ConversationItem key={conversation.id} conversation={conversation} conversationSelected={this.props.conversationSelected}/>
							
						
					)
				})}
				</div>
			</div>
		);
	}

	searchUpdated (term) {
    	this.setState({searchTerm: term})
  	}
  	
  	createArray(){
  		var conversationarray = [];
		for(var x in this.props.conversations){
		  conversationarray.push(this.props.conversations[x]);
		}
		return conversationarray;
  	}
}

export default ConversationList;