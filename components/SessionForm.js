import React, { Component } from 'react'

const SessionForm = Component => class extends React.Component {
	constructor(props){
		super(props);
	}
		
	render() {
    	return (
			<div id='chat-login'>
				<Component {...this.props}/>
			</div>
		)
	}
}

export default SessionForm;