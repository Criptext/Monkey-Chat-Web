import React, { Component } from 'react'
var $ = require('jquery');

class QuestionForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: '',
			loading : false
		};

		this.handleSubmitQuestion = this.handleSubmitQuestion.bind(this);
	}
	
	render() {
		let rendering;

		switch(this.state.status){
			case "success":
				rendering = <div className='wid-reconnect-form'>
					<div className='wid-separator'></div>
					<div className="wid-check-container">
						<img src="https://cdn.criptext.com/messenger/enterprise_check.png" className="wid-overlay-check" />
						<p className="wid-overlay-msg-subtitle">
							Thank you! we received your message and will answer you asap!
						</p>
					</div>
				</div>
				break;
			case "error":
				rendering = <div className='wid-reconnect-form'>
					<div className='wid-separator'></div>
					<div className="wid-check-container">
						<img src="https://cdn.criptext.com/messenger/enterprise_fail.png" className="wid-overlay-check" />
						<p className="wid-overlay-msg-subtitle">
							Sorry, the message wasn{"'"}t delivered. Please try again later.
						</p>
						<a href="#" onClick={ () => {this.setState({status : ""}) } } className="wid-go-back">Go Back</a>
					</div>
				</div>
				break;
			default : 
				rendering = <div className='wid-reconnect-form'>
					<div className='wid-separator'></div>
					<form>
						<div className="wid-reconnect-description">
							<p className="wid-overlay-msg-title">
								We{"'"}re sorry, it{"'"}s difficult to answer your questions outside support hours
							</p>
							<p className="wid-overlay-msg-subtitle">
								We will be glad to help you, please leave us your email and question and we will answer ASAP!
							</p>
							<div className="wid-name-container">
								<label>
									E-mail :
								</label> 
								<input ref="mail_address"/>
							</div>
							<textarea ref="mail_content" className="wid-textarea">
							</textarea>
						</div>
						<div className='field field-input-submit'>
							{ this.state.loading 
								? <input type='button' value='Sending...' className='wid-input-button'></input>
								: <input type='submit' value='Send Question' className='wid-input-button' onClick={this.handleSubmitQuestion}></input>
							}
						</div>
					</form>
				</div>
		}
		
		return rendering;

	}

	handleSubmitQuestion(event) {
		event.preventDefault();
		console.log(this.refs.mail_content.value + " : " + this.refs.mail_address.value);
		let email = this.refs.mail_address.value.trim();
		let text = this.refs.mail_content.value.trim();

		if(!email || !text){
			return;
		}

		this.setState({status : '', loading : true})

		let params = { name: this.props.name,
			text : text,
			mail : email,
			sendTo : this.props.mail};
		apiCriptextCall({data : params},'POST','/enterprise/client/mail/send',(err, response) => {
			if(err && err.status != 200){
	            this.setState({status : "error", loading : false})
	        }else{
		        this.setState({status : "success", loading : false})
	        }
	    });

	}
}

export default QuestionForm;


function apiCriptextCall(params, type, endpoint, callback){

    switch(type) {
        case 'GET':
            $.ajax({
                type    : type,
                url     : ""+endpoint,
                crossDomain: true,
                dataType: 'json',
                success: function(respObj){
                    callback(null, respObj);
                },
                error: function(err){
                    console.log('Error :'+JSON.stringify(err));
                    callback(err);
                }
            });
            break;
        case 'POST':
            $.ajax({
                type    : type,
                url     : ""+endpoint,
                crossDomain: true,
                dataType: 'json',
                data    : params,
                success: function(respObj){
                    //console.log('RespObj:'+JSON.stringify(respObj));
                    callback(null, respObj);
                },
                error: function(err){
                    console.log('Error :'+JSON.stringify(err));
                    callback(err);
                }
            });
            break;
        default:
            console.log('Unknown weather type!');
            break;
    }
}