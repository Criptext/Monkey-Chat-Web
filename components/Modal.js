import React, { Component } from 'react'

const Modal = Component => class extends Component {
	constructor(props){
		super(props);
		this.state = {
			messageSelected: this.props.messageSelected,
			visible: ''
		}
		this.hideViewer = this.hideViewer.bind(this);
	}
	
	render() {
		return(
			<div className={'mky-viewer-content ' + this.state.visible}> 
				<button id="mky-button-exit" onClick={this.hideViewer}> X </button> 
				<Component {...this.props}/>
			</div>
		)
	}
	
	hideViewer() {
		this.props.showModal();
	}
}

export default Modal;