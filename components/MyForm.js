import React, { Component } from 'react'

class MyForm extends React.Component {
	constructor(props) {
		super(props);
		this.loginChat = this.loginChat.bind(this);
	}
	
	render() {
		return (
			<div>
				<img className="monkey-logo" src="https://cdn.criptext.com/MonkeyUI/images/monkey_widget_logo.png"></img>
					<form className="chat-login-container">
						<div className="field-login-text">
							<p className="title"> <b>Welcome to our secure live-chat</b>  </p>
							<p className="subtittle">Please enter the information I need</p>
						</div>
						<div className="field field-input-name">
							<input type="text" id="user_name" placeholder="Name"></input>
							<div className="error">Name must contain at least 2 character.</div>
						</div>
						<div className="field field-input-submit">
							<input type="submit" value="SUBMIT" id="submitChat" onclick={this.loginChat}></input>
						</div>
					</form>
				<div className="monkey_footer_sign">Powered by <a href="http://criptext.com/">Criptext</a></div>
			</div>
		)
	}
	
	loginChat() {
		
	}
}

export default MyForm;