import React, { Component } from 'react'
import styles from '../styles/myform.css';

class MyForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: ''	
		};
		this.login = this.login.bind(this);
		this.handleOnChangeInput = this.handleOnChangeInput.bind(this);
	}
	
	render() {
		return (
			<div className='monkey-login'>
				<img className='monkey-logo' src='https://cdn.criptext.com/MonkeyUI/images/monkey_widget_logo.png'></img>
					<form className='chat-login-container'>
						<div className='field-login-text'>
							<p className='title'> <b>Welcome to our secure live-chat</b>  </p>
							<p className='subtittle'>Please enter the information I need</p>
						</div>
						<div className='field field-input-name'>
							<input type='text' id='user_name' placeholder='Name' value={this.state.text} onChange={this.handleOnChangeInput}></input>
							<div className='error'>Name must contain at least 2 character.</div>
						</div>
						<div className='field field-input-submit'>
							<input type='submit' value='SUBMIT' id='submitChat' onClick={this.login}></input>
						</div>
					</form>
				<div className='monkey_footer_sign'>Powered by <a href='http://criptext.com/'>Criptext</a></div>
			</div>
		)
	}
	
	handleOnChangeInput(event, value) {
		this.setState({text: event.target.value});
	}
	
	login(event) {
		event.preventDefault();
		let text = this.state.text.trim();
		if(text){
			let user = {
				name: text
			}
			this.props.handleLoginSession(user);
		}
		this.setState({text: ''});
	}
}

export default MyForm;