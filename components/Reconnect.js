import React, { Component } from 'react'

class Reconnect extends Component {
	constructor(props) {
		super(props);
		this.state = {
			text: ''
		};
		this.handleReconnect = this.handleReconnect.bind(this);
		this.defineReconnectDescription = this.defineReconnectDescription.bind(this);
	}
	
	render() {
		return (
			<div className='wid-reconnect-form'>
				<div className='wid-separator'></div>
				<form>
					<div className='wid-reconnect-description'>
						<p>{this.defineReconnectDescription()}</p>
					</div>
					<div className='field field-input-submit'>
						<input type='submit' value='Start new chat' id='submitChat' onClick={this.handleReconnect}></input>
					</div>
				</form>
			</div>
		)
	}
	
	handleReconnect(event) {
		event.preventDefault();
		this.props.onReconnect();
	}

	defineReconnectDescription(){
		if(this.props.description){
			return this.props.description;
		}
		return 'The session with your operator has ended';
	}
}

export default Reconnect;