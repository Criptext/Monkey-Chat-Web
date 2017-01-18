import React, { Component } from 'react'
import Textarea from 'react-autosize-textarea'
import * as vars from '../utils/monkey-const.js'
import { getCombineColor } from 'react-monkey-ui'
var $ = require('jquery');

class QuestionForm extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			status: '',
			loading: false,
			message: '',
			email: this.props.email,
			errorMail: false,
			errorText: false,
		};

		this.handleSubmitQuestion = this.handleSubmitQuestion.bind(this);
		this.handleOnChangeTextArea = this.handleOnChangeTextArea.bind(this);
	}
	
	render() {
		let styleForm = this.defineStyles();
		let rendering = <div className='wid-send-mail-header' style={{background: this.props.color || ''}}>
			<p className='wid-overlay-msg-title' style={{color : this.props.fontColor || ''}}>
				We{'\''}re currently offline!
			</p>
			<p className='wid-overlay-msg-subtitle' style={styleForm.paragraph}>
				Live support is available:<br/>
				{this.props.beginDay} - {this.props.endDay}<br/>
				{this.props.period}
			</p>
		</div>;
		let textClass = 'wid-textarea' + (this.state.errorText ? ' wid-input-error' : '');

		switch(this.state.status){
			case 'success':
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className='wid-send-mail-body'>
						<div className='wid-check-container'>
							<img src='https://cdn.criptext.com/messenger/enterprise_check.png' className='wid-overlay-check' />
							<p className='wid-overlay-msg-subtitle'>
								Thank you! we received your message and will answer you ASAP!
							</p>
						</div>
					</div>
				</div>
				break;
			case 'error':
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className='wid-send-mail-body'>
						<div className='wid-check-container'>
							<img src='https://cdn.criptext.com/messenger/enterprise_fail.png' className='wid-overlay-check' />
							<p className='wid-overlay-msg-subtitle'>
								Sorry, the message wasn{'\''}t delivered. Please try again later.
							</p>
							<a href='#' onClick={ () => {this.setState({status : ''}) } } className='wid-go-back'>Go Back</a>
						</div>
					</div>
				</div>
				break;
			default : 
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className='wid-send-mail-body'>
						<p className='wid-overlay-msg-title wid-overlay-body-title'>
							Leave us a Message!
						</p>
						<div className='wid-name-container'>
							<input ref='mail_address' placeholder='Email' onClick={ () => {this.setState({errorMail : false}) } } className={this.state.errorMail ? 'wid-input-error' : null} defaultValue={this.state.email}/>
						</div>
						<div className='wid-textarea-container'>
							<Textarea ref='textareaInput'
								className={textClass} 
								placeholder='Message' 
								value = {this.state.message}
								onChange={this.handleOnChangeTextArea}/>
						</div>
						{ this.state.loading 
							? <input type='button' value='Sending...' className='wid-input-button'></input>
							: <input type='submit' value='Send' className='wid-input-button' onClick={this.handleSubmitQuestion}></input>
						}
					</div>
				</div>
		}
		
		return rendering;

	}
	
	defineStyles() {
		let style = {
			paragraph: {}
		};
		if(this.context.styles){
			if(this.context.styles.toggleColor){
				style.paragraph.color = getCombineColor(this.context.styles.toggleColor);
			}
			if(this.context.styles.subtitleTextColor){
				style.paragraph.color = this.context.styles.subtitleTextColor;
			}
		}
		
		return style;
	}
	
	handleSubmitQuestion(event) {
		event.preventDefault();
		let email = this.refs.mail_address.value.trim();
		let text = this.state.message.trim();
		let invalidData = false;

		if(!text){
			this.setState({
				errorText : true,
			})
			invalidData = true;
		}
		if(!email || !email.match(/^[\w\-\+_]+(?:\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(?:\.[\w‌​\-\+_]+)*\s*$/)){
			this.setState({
				errorMail : true,
			})
			invalidData = true;
		}

		if(invalidData){
			return;
		}

		this.setState({status : '', loading : true, email : email})

		let params = { name: this.props.name,
			text : text,
			mail : email,
			sendTo : this.props.mail};
		apiCriptextCall({data : params},'POST','/enterprise/client/mail/send',(err, response) => {
			if(err && err.status != 200){
	            this.setState({status : 'error', loading : false})
	        }else{
		        this.setState({status : 'success', loading : false})
	        }
	    });
	}

	handleOnChangeTextArea(event){
		this.setState({message: event.target.value, errorText : false});
	}
}

export default QuestionForm;


function apiCriptextCall(params, type, endpoint, callback){

    switch(type) {
        case 'GET':
            $.ajax({
                type    : type,
                url     : vars.MESSENGER_CRIPTEXT_URL+endpoint,
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
                url     : vars.MESSENGER_CRIPTEXT_URL+endpoint,
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

QuestionForm.contextTypes = {
    styles: React.PropTypes.object.isRequired
}