import React, { Component } from 'react'
import Dropzone from 'react-dropzone';

// ======================
// MediaStreamRecorder.js
var MediaStreamRecorder = require('../src/MediaStreamRecorder.js').MediaStreamRecorder;
window.StereoRecorder = require('../src/MediaStreamRecorder.js').StereoRecorder;

// ======================
// FileAPI.js
require('fileapi/dist/FileAPI.min.js');

// ======================
// jquery.knob.js
require('jquery-knob/dist/jquery.knob.min.js');
var $ = require('jquery');
window.jQuery = $;
window.$ = $;

class Input extends Component {
	constructor(props) {
		super(props);
		this.state = {
			classSendButton: 'mky-disappear',
			classAudioButton: '',
			classAudioArea: 'mky-disappear',
			classCancelAudioButton: 'mky-disappear',
			classAttachButton: '',
			classTextArea: '',
			minutes: '00',
			seconds: '00',
			files: null
		}
		this.handleOnKeyUpTextArea = this.handleOnKeyUpTextArea.bind(this);
		this.handleOnKeyDownTextArea = this.handleOnKeyDownTextArea.bind(this);
		this.textMessageInput = this.textMessageInput.bind(this);
		
		this.handleRecordAudio = this.handleRecordAudio.bind(this);
		this.startRecordAudio = this.startRecordAudio.bind(this);
		this.onMediaSuccess = this.onMediaSuccess.bind(this);
		this.onMediaError = this.onMediaError.bind(this);
		this.handleCancelAudio = this.handleCancelAudio.bind(this);
		this.setTime = this.setTime.bind(this);
		this.clearAudioRecordTimer = this.clearAudioRecordTimer.bind(this);
		this.handleAttach = this.handleAttach.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.catchUpFile = this.catchUpFile.bind(this);
		this.getExtention = this.getExtention.bind(this);
		this.generateDataFile = this.generateDataFile.bind(this);
		this.mediaRecorder;
		this.micActivated;
		this.mediaConstraints = {
		    audio: true
		};
		this.secondsRecording = 0;
		this.refreshIntervalId;
	}
	
	render() {
    	return (
			<div id='mky-chat-input'>
				<div id="mky-divider-chat-input"></div>
				<div className={'mky-button-input '+this.state.classAttachButton}>
					<button id="mky-button-attach" className='mky-button-icon' onClick={this.handleAttach}></button>
				</div>
				<div className={'mky-button-input '+this.state.classCancelAudioButton}>
					<button id="mky-button-cancel-audio" className='mky-button-icon' onClick={this.handleCancelAudio}></button>
				</div>
				<textarea ref='textareaInput' id="mky-message-text-input" className={'mky-textarea-input '+this.state.classTextArea} placeholder="Write a secure message" onKeyDown={this.handleOnKeyDownTextArea} onKeyUp={this.handleOnKeyUpTextArea}></textarea>
				<div id="mky-record-area" className={this.state.classAudioArea}>
					<div className="mky-record-preview-area">
						<div id='mky-button-action-record'>
							<button id="mky-button-start-record" className="mky-blink"></button>
						</div>
						<div id="mky-time-recorder">
							<span id="mky-minutes">{this.state.minutes}</span><span>:</span><span id="mky-seconds">{this.state.seconds}</span>
						</div>
					</div>
				</div>
				<div className={'mky-button-input '+this.state.classSendButton}>
					<button id="mky-button-send-message" className="mky-button-icon"></button>
				</div>
				<div className={'mky-button-input mky-disabledd '+this.state.classAudioButton}>
					<button id="mky-button-record-audio" className="mky-button-icon" onClick={this.handleRecordAudio}></button>
				</div>
				<Dropzone ref="dropzone" className='mky-disappear' onDrop={this.onDrop} >
	            	<div>Try dropping some files here, or click to select files to upload.</div>
	            </Dropzone>
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
                window.navigator.getUserMedia(this.mediaConstraints, this.onMediaSuccess, this.onMediaError);
                this.micActivated=!this.micActivated;
            }else{
                this.onMediaSuccess(this.mediaConstraints);
                pauseAllAudio ('');
            }
        }
    }
    
    // if the browser can record, this is executed
    onMediaSuccess(stream) {
        //default settings to record
        this.mediaRecorder = new MediaStreamRecorder(stream);
        this.mediaRecorder.mimeType = 'audio/wav';
        this.mediaRecorder.audioChannels = 1;
        this.mediaRecorder.ondataavailable = function (blob) {
            this.clearAudioRecordTimer();
            var timestamp = new Date().getTime();
            audioCaptured.blob = blob; //need to save the raw data
            audioCaptured.src = URL.createObjectURL(blob); // need to save de URLdata
        };

        this.refreshIntervalId = setInterval(this.setTime, 1000);//start recording timer
        this.mediaRecorder.start(99999999999);//starts recording
    }
    
    onMediaError(e) {
        console.error('media error', e);
    }
    
    setTime() {
	    console.log(this.secondsRecording);
	    ++this.secondsRecording;
	    let seconds = ("0" + this.secondsRecording%60).slice(-2);
        this.setState({seconds: seconds});
        let minutes = ("0" + parseInt(this.secondsRecording/60)).slice(-2);
        this.setState({minutes: minutes});
    }
    
    handleCancelAudio() {
	    this.setState({
			classAudioArea: 'mky-disappear',
			classCancelAudioButton: 'mky-disappear',
			classAttachButton: '',
			classSendButton: 'mky-disappear',
			classTextArea: '',
			classAudioButton: ''
		});
		this.clearAudioRecordTimer();
/*
		let audio = document.getElementById('audio_'+timestampPrev);
        if (audio != null)
            audio.pause();
*/
        this.mediaRecorder = null;
    }
    
    clearAudioRecordTimer() {
        this.secondsRecording = 0; //encera el timer
        clearInterval(this.refreshIntervalId);
        this.setState({
			seconds: '00',
	        minutes: '00'
		});
    }
    
    handleAttach() {
	    this.refs.dropzone.open();
    }
    
    onDrop(files) {
		//this.setState({files: files});
		let _file;
	    files.map((file) => (_file = file))
		this.catchUpFile(_file);
    }
    
    catchUpFile(file) {
	    //console.log(file);
        //fileCaptured.file = file;
        //console.log(fileCaptured.file)
        //fileCaptured.ext = this.getExtention(fileCaptured.file);
        //let type = checkExtention(file);
        this.generateDataFile(file);
/*
        if (type >= 1 && type <= 4) {
            //typeMessageToSend = 4;
            //fileCaptured.monkeyFileType = 4;
            
        } else if (type == 6) {
            //typeMessageToSend = 3;
            //fileCaptured.monkeyFileType = 3;
            this.generateDataFile(file);
            //return;
        } else {
            //return false;
        }
*/
    }
    
    generateDataFile(file) {
        FileAPI.readAsDataURL(file, (evt) => {
            if( evt.type == 'load' ){
	            console.log(file);
	            console.log(evt);
	            let message = {data: evt.result}
	            
	            let type = this.checkExtention(file);
	            switch(type){
		            case 1:{
			            message.type = 2;
			            break;
		            }
		            case 2:{
			            message.type = 3;
			            break;
		            }
	            }
	            
	            
				this.props.messageToSet(message);
                //fileCaptured.src = evt.result;
                //$('#mky-button-send-message').click();
            }
        });
    }
    
    getExtention(file) {
        let arr = file.name.split('.');
        let extension= arr[arr.length-1];
        return extension;
    }
    
    checkExtention(files) {
        var ft=0;  //fileType by extention

/*
        var doc=["doc","docx"]; //1
        var pdf=["pdf"]; //2
        var xls=["xls", "xlsx"]; //3
        var ppt=["ppt","pptx"]; //4
*/
        
        var file=["doc","docx","pdf","xls", "xlsx","ppt","pptx"];
        var img=["jpe","jpeg","jpg","png","gif"]; //6

        var extension = this.getExtention(files);

/*
        if((doc.indexOf(extension)>-1)){
            ft=1;
        }
        if(xls.indexOf(extension)>-1){
            ft=3;
        }
        if(pdf.indexOf(extension)>-1){
            ft=2;
        }
        if(ppt.indexOf(extension)>-1){
            ft=4;
        }
*/
        
        if(img.indexOf(extension)>-1){
            ft=1;
        }else if(file.indexOf(extension)>-1){
	        ft=2;
        }

        return ft;
    }
}

export default Input;