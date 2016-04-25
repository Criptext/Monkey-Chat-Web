import React, { Component } from 'react'

const ContentLogin = Component => class extends React.Component {
	constructor(props){
		super(props);
	}
		
	render() {
    	return (
			<div id='mky-chat-login'>
				<Component {...this.props}/>
			</div>
		)
	}
}

export default ContentLogin;