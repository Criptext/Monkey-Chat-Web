import React, { Component } from 'react'

class BubbleImage extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="mky-content-image">
				<img src={this.props.message.data}></img>
			</div>
		)
	}
}

export default BubbleImage;