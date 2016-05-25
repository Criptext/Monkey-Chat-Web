import React, { Component } from 'react'

export default class ModalGeneric extends Component {
	constructor(props){
		super(props);
	}
	
	render() {
		return(
			<div className={'mky-generic-modal'}>
				<div className={'mky-back-modal'} onClick={this.props.closeModal}> 
				</div>
				{this.props.children}
			</div>
		)
	}
	
}