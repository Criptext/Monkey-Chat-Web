import React, { Component } from 'react'

class Input extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			classSendButton: 'mky-disappear',
			classAudioButton: '',
			classAudioArea: 'mky-disappear',
			classCancelAudioButton: 'mky-disappear',
			classAttachButton: '',
			classTextArea: ''
		}
		this.handleOnKeyUpTextArea = this.handleOnKeyUpTextArea.bind(this);
		this.handleOnKeyDownTextArea = this.handleOnKeyDownTextArea.bind(this);
		this.textMessageInput = this.textMessageInput.bind(this);
		
		this.handleRecordAudio = this.handleRecordAudio.bind(this);
		this.startRecordAudio = this.startRecordAudio.bind(this);
		this.mediaRecorder;
		this.micActivated
	}
	
	render() {
    	return (
			<div id='mky-chat-input'>
				<div id="mky-divider-chat-input"></div>
				<div className={'mky-button-input '+this.state.classAttachButton}>
					<button id="mky-button-attach" className='mky-button-icon'></button>
				</div>
				<div className={'mky-button-input '+this.state.classCancelAudioButton}>
					<button id="mky-button-cancel-audio" className='mky-button-icon'></button>
				</div>
				<textarea ref='textareaInput' id="mky-message-text-input" className={'mky-textarea-input '+this.state.classTextArea} placeholder="Write a secure message" onKeyDown={this.handleOnKeyDownTextArea} onKeyUp={this.handleOnKeyUpTextArea}></textarea>
				<div id="mky-record-area" className={this.state.classAudioArea}>
					<div className="mky-record-preview-area">
						<div id='mky-button-action-record'>
							<button id="mky-button-start-record" className="mky-blink"></button>
						</div>
						<div id="mky-time-recorder">
							<span id="mky-minutes">00</span><span>:</span><span id="mky-seconds">00</span>
						</div>
					</div>
				</div>
				<div className={'mky-button-input '+this.state.classSendButton}>
					<button id="mky-button-send-message" className="mky-button-icon"></button>
				</div>
				<div className={'mky-button-input mky-disabledd '+this.state.classAudioButton}>
					<button id="mky-button-record-audio" className="mky-button-icon" onClick={this.handleRecordAudio}></button>
				</div>
			</div>
		);
	}
	
	textMessageInput(text) {
		let message = {
			type: 1,
			text: text
		}
		this.props.messageToSet(message);	
	}
	
	handleOnKeyDownTextArea(e) {
		if (e.key === 'Enter' && !e.shiftKey){
			console.log('enter');
			this.textMessageInput(e.target.value);
			this.refs.textareaInput.value = '';
			return false;
		}
	}
	
	handleOnKeyUpTextArea(e) {
		if (e.key === 'Enter' && !e.shiftKey){
			this.refs.textareaInput.value = '';
			return false;
		}
	}
	
	handleRecordAudio() {
		this.setState({
			classAudioArea: 'mky-appear',
			classCancelAudioButton: '',
			classAttachButton: 'mky-disappear',
			classSendButton: '',
			classTextArea: 'mky-disappear',
			classAudioButton: 'mky-disappear'
		});
		this.startRecordAudio();
	}
	
	startRecordAudio() {
        if (this.mediaRecorder == null) {
            if (!this.micActivated) {
                navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
                this.micActivated=!this.micActivated;
            }else{
                onMediaSuccess(mediaConstraints);
                pauseAllAudio ('');
            }
        }
    }
    
}

export default Input;