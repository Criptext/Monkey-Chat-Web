import React, { Component } from 'react'

class InputMenu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="menu-bubble" className="menu-bubble" style={{display : this.props.visible ? "block" : "none"}}>
				{/*<div className="menu-bubble-item" onClick={this.props.enableGeoInput}><i id="mnk-menu-location-icon" className="demo-icon mky-location">&#xe815;</i><p>Send Location</p></div>*/}
				{/* <div className="menu-bubble-item" onClick={this.props.handleAttach}><i id="mnk-menu-attach-icon" className="demo-icon mky-attach">&#xe819;</i> <p>Attach File</p></div>*/}
				<div className="menu-bubble-item" onClick={this.props.handleAttach}><i id="mnk-menu-attach-icon" className="demo-icon mky-attach">&#xe82a;</i><div>Image</div></div>
				<div className="menu-bubble-item" onClick={this.props.handleAttach}><i id="mnk-menu-attach-file" className="demo-icon mky-attach">&#xe82b;</i><div>File</div></div>

				<div id="layer-menu" onClick={this.props.toggleVisibility} ></div>
			</div>
		)
	}
}

export default InputMenu;
