import React, { Component } from 'react'

class InputMenu extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (<div id="menu-bubble" className="menu-bubble" style={{display : this.props.visible ? "block" : "none"}}>
				<div className="menu-bubble-item" onClick={this.props.enableGeoInput}><img src="images/location.svg" /><p>Send Location</p></div>
				<div className="menu-bubble-item" onClick={this.props.handleAttach}><img src="images/Attach.svg" /><p>Attach File</p></div>
			</div>);
	}
}

export default InputMenu;