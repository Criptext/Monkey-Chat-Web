import React, { Component } from 'react'
import ConversationItem from './ConversationItem.js';
import SearchInput, {createFilter} from 'react-search-input';
import ReactDOM from 'react-dom';
import ModalGeneric from './ModalGeneric.js'
import DeleteConversation from './DeleteConversation.js'

const KEYS_TO_FILTERS = ['name']

class ConversationList extends Component {

	constructor(props) {
		super(props);
	    this.state = {
		    searchTerm: '',
			conversation: {id: -1},
			conversationArray: undefined,
			isDeleting : false,
			deletingConversation : undefined,
			deletingIndex : undefined,
			deletingActive : undefined
		}
	    this.searchUpdated = this.searchUpdated.bind(this);
	    this.conversationIdSelected = this.conversationIdSelected.bind(this);
	    this.handleDeleteConversation = this.handleDeleteConversation.bind(this);
	    this.handleAskDeleteConversation = this.handleAskDeleteConversation.bind(this);
	    this.setConversationSelected = this.setConversationSelected.bind(this);
	    this.handleCloseModal = this.handleCloseModal.bind(this);
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
		console.log(this.state.isDeleting);
    	return (
    		<div className='mky-session-conversations'>
    			{ this.state.isDeleting	? <ModalGeneric closeModal={this.handleCloseModal}><DeleteConversation delete={this.handleDeleteConversation} closeModal={this.handleCloseModal} /> </ModalGeneric> : null }
	    		<SearchInput className='mky-search-input' onChange={this.searchUpdated} />
	    		<ul ref='conversationList' id='mky-conversation-list'>
				{conversationNameFiltered.map( (conversation, index) => {
	    			return (
						<ConversationItem index={index} deleteConversation={this.handleAskDeleteConversation} key={conversation.id} conversation={conversation} conversationIdSelected={this.conversationIdSelected} selected={this.state.conversation.id === conversation.id}/>
					)
				})}
				</ul>
			</div>
		)
	}

	handleCloseModal(){
		this.setState({
			isDeleting : false
		});
	}

	handleAskDeleteConversation(conversation, index, active){
		this.setState({
			deletingConversation : conversation,
			deletingIndex : index,
			deletingActive : active,
			isDeleting : true
		});
	}

	handleDeleteConversation(){
		var conversationNameFiltered = this.state.conversationArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
		var nextConversation = conversationNameFiltered[this.state.deletingIndex + 1];
		if(!nextConversation){
			nextConversation = conversationNameFiltered[this.state.deletingIndex - 1];
		}
		this.props.deleteConversation(this.state.deletingConversation, nextConversation, this.state.deletingActive, this.setConversationSelected);
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

	setConversationSelected(conversationId) {
		console.log('Deleting');
		if(conversationId < 0){
			this.setState({
				isDeleting: false
			});
		}else{
			this.setState({
				conversation: this.props.conversations[conversationId],
				isDeleting: false
			});
		}
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
	        if(a.messages[a.lastMessage] == null || a.messages.length == 0)
	        	return 1;
	        if(b.messages[b.lastMessage] == null || b.messages.length == 0)
	        	return -1;
	        return b.messages[b.lastMessage].datetimeCreation - a.messages[a.lastMessage].datetimeCreation;
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