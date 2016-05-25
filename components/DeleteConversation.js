import React, { Component } from 'react'

export default class DeleteConversation extends Component {
	constructor(props){
		super(props);
	}
	
	render() {
		return(
			<div className="mky-inner-modal">
				<div className="mky-question"> Are you sure you want to delete the conversation </div>
				<button className="mky-button-left" onClick={this.props.delete}> Yes </button>
				<button className="mky-button-right" onClick={this.props.closeModal}> No </button>
			</div>
		)
	}
	
}