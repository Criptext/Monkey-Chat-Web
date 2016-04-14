import React, { Component } from 'react'

class BubbleText extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return <span className="mky-content-text">{this.props.message.text}</span>
	}
}

export default BubbleText;