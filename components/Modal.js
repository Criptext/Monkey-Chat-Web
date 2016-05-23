import React, { Component } from 'react'

const Modal = Component => class extends Component {
	constructor(props){
		super(props);
		this.close = this.close.bind(this);
	}

	render() {
		return(
			<div className={'mky-viewer-content' + ' animated zoomIn'}> 
				<button id="mky-button-exit" onClick={this.close}> X </button>
				<Component {...this.props}/>
			</div>
		)
	}

	close() {
		this.props.closeModal();
	}
}

export default Modal;
