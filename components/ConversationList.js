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
		console.log( JSON.stringify(conversation_list));

    	return (
    		<div>
    		<SearchInput className="search-input" onChange={this.searchUpdated} />
			{filteredEmails.map(conversation => {
    			return (
					<ul id='mky-conversation-list'>
						{
							Object.keys(this.props.conversations).map( key => {
								const conversation = this.props.conversations[key];
								return <ConversationItem key={conversation.id} conversation={conversation} conversationSelected={this.props.conversationSelected}/>
							})
						}
					</ul>
				)
			})}
			</div>
		);
	}

	searchUpdated (term) {
    	this.setState({searchTerm: term})
  	}
  	createArray(){
  		var conversationarray = [];
  		Object.keys(this.props.conversations).map( key => {
			const conversation = this.props.conversations[key];
			conversationarray.push({id:conversation.id, name:conversation.name});
		})
		return conversationarray;
  	}
}

export default ConversationList;