import React, { Component } from 'react'
import Dropzone from 'react-dropzone';
import InputMenu from './InputMenu.js';
import { getExtention } from '../utils/monkey-utils.js'

var ReactToastr = require("react-toastr");
var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

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
// 			files: null,
			text: '',
            menuVisibility: 0,
            creatingAudio: false
		}
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
		this.generateDataFile = this.generateDataFile.bind(this);
		this.handleSendMessage = this.handleSendMessage.bind(this);
		this.buildAudio = this.buildAudio.bind(this);
		this.buildMP3 = this.buildMP3.bind(this);
		this.getFFMPEGWorker = this.getFFMPEGWorker.bind(this);
        this.handleMenuVisibility = this.handleMenuVisibility.bind(this);
		this.readData = this.readData.bind(this);
		this.pauseAllAudio = this.pauseAllAudio.bind(this);
		this.handleOnChangeTextArea = this.handleOnChangeTextArea.bind(this);
		this.mediaRecorder;
		this.micActivated;
		this.mediaConstraints = {
		    audio: true
		};
		this.secondsRecording = 0;
		this.refreshIntervalId;
		this.typeMessageToSend = 0;
		this.audioCaptured= {};
		this.audioMessageOldId;
		this.ffmpegRunning = false;
		this.ffmpegWorker;
	}

    componentWillReceiveProps(nextProps){
/*
        this.setState({
            option: 0
        });
*/
    }

	render() {
    	return (
			<div id='mky-chat-input'>
				<div className="mky-chat-inner-input">
					<div id='mky-divider-chat-input'></div>
					<div className={'mky-button-input '+this.state.classAttachButton}>
						<i id="mky-button-attach" className="mky-button-icon demo-icon mky-attach" onClick={this.handleMenuVisibility}>&#xe825;</i>
					</div>
	                <InputMenu toggleVisibility={this.handleMenuVisibility} visible={this.state.menuVisibility} enableGeoInput={this.props.enableGeoInput} handleAttach={this.handleAttach}/>
					<div className={'mky-button-input '+this.state.classCancelAudioButton}>

						<i id="mky-button-cancel-audio" className=" mky-button-icon demo-icon mky-trashcan-empty"  onClick={this.handleCancelAudio}>&#xe809;</i>
					</div>
					<textarea ref='textareaInput' id="mky-message-text-input" className={'mky-textarea-input '+this.state.classTextArea} value={this.state.text} placeholder="Write a secure message" onKeyDown={this.handleOnKeyDownTextArea} onChange={this.handleOnChangeTextArea}></textarea>
					<div id='mky-record-area' className={this.state.classAudioArea}>
						<div className="mky-record-preview-area">
							<div id='mky-button-action-record'>
								<button id="mky-button-start-record" className="mky-blink"></button>
							</div>
							<div id='mky-time-recorder'>
								<span id="mky-minutes">{this.state.minutes}</span><span>:</span><span id="mky-seconds">{this.state.seconds}</span>
							</div>
						</div>
					</div>
					<div className={'mky-button-input '+this.state.classSendButton}>
						<i id='mky-button-send-message'  className="demo-icon mky-send-empty" onClick={this.handleSendMessage}>&#xe80b;</i>
					</div>
					<div className={'mky-button-input mky-disabledd '+this.state.classAudioButton}>
					{ this.state.creatingAudio
						? (
							<div className="mky-spinner-input-audio">
								<div className="mky-rect1"></div>
								<div className="mky-rect2"></div>
								<div className="mky-rect3"></div>
								<div className="mky-rect4"></div>
							</div>
						)
						: <i  id="mky-button-record-audio" className=" mky-button-icon demo-icon mky-mic-empty" onClick={this.handleRecordAudio}>&#xe823;</i>

					}
					</div>
					<Dropzone ref="dropzone" className='mky-disappear' onDrop={this.onDrop} >
		            	<div>Try dropping some files here, or click to select files to upload.</div>
		            </Dropzone>
	                <ToastContainer ref="container"
	                        toastMessageFactory={ToastMessageFactory}
	                        className="toast-bottom-center" />
				</div>
			</div>
		);
	}

	componentDidMount() {
		this.ffmpegWorker = this.getFFMPEGWorker();
	}

    handleMenuVisibility(){
        this.setState({menuVisibility : !this.state.menuVisibility});
    }

	textMessageInput(text) {
		let message = {
			bubbleType: 'text',
			text: text,
			preview: text
		}
		this.props.messageCreated(message);
	}

	handleOnKeyDownTextArea(event) {
		this.typeMessageToSend = 0;
		if(event.keyCode === 13 && !event.shiftKey) {
			event.preventDefault()
			let text = this.state.text.trim();
			if(text){
				this.textMessageInput(event.target.value.trim());
			}
			this.setState({text: ''});
		}
	}

	handleOnChangeTextArea(event, value){
		this.setState({text: event.target.value});
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
		this.typeMessageToSend = 1;

        if (this.mediaRecorder == null) {
            if (!this.micActivated) {
                window.navigator.getUserMedia(this.mediaConstraints, this.onMediaSuccess, this.onMediaError);
                this.micActivated=!this.micActivated;
            }else{
                this.onMediaSuccess(this.mediaConstraints);
                this.pauseAllAudio ('');
            }
        }
    }

    onMediaSuccess(stream) {
        //default settings to record
        this.mediaRecorder = new MediaStreamRecorder(stream);
        this.mediaRecorder.mimeType = 'audio/wav';
        this.mediaRecorder.audioChannels = 1;
        var that = this;
        this.mediaRecorder.ondataavailable = function (blob) {
//             that.clearAudioRecordTimer();
            var timestamp = new Date().getTime();
            that.audioCaptured.blob = blob; //need to save the raw data
            that.audioCaptured.src = URL.createObjectURL(blob); // need to save de URLdata
        };

        this.refreshIntervalId = setInterval(this.setTime, 1000);//start recording timer
        this.mediaRecorder.start(99999999999);//starts recording
    }

    onMediaError(e) {
        console.error('media error', e);
    }

    setTime() {
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
        this.mediaRecorder = null;
    }

    handleSendMessage(){
    	switch (this.typeMessageToSend) {
            case 0:
     			this.textMessageInput(e.target.value);
     			break;
            case 1:
            	if (this.mediaRecorder != null) {
                    this.mediaRecorder.stop(); //detiene la grabacion del audio
                }
                this.audioCaptured.duration = this.secondsRecording;
                this.setState({creatingAudio: true});
                this.clearAudioRecordTimer();
	               //      monkeyUI.showChatInput();
	            this.buildAudio();
	               //      mediaRecorder = null;
                this.handleCancelAudio()
            	break;
            case 3:

				break;
            case 4:

            	break;
            default:

                break;
        }
    }

    clearAudioRecordTimer() {
        this.secondsRecording = 0;
        clearInterval(this.refreshIntervalId);
        this.setState({
			seconds: '00',
	        minutes: '00'
		});
    }

    buildAudio() {
        // if (globalAudioPreview != null) pauseAudioPrev();

        this.audioMessageOldId = Math.round(new Date().getTime() / 1000 * -1);
        // drawAudioMessageBubbleTemporal(this.audioCaptured.src, { id: this.audioMessageOldId, timestamp: Math.round(new Date().getTime() / 1000) }, this.audioCaptured.duration);
        // disabledAudioButton(true);
        var that = this;
        FileAPI.readAsArrayBuffer(this.audioCaptured.blob, function (evt) {
            if (evt.type == 'load') {
                that.buildMP3('audio_.wav', evt.result);
            } else if (evt.type == 'progress') {
                var pr = evt.loaded / evt.total * 100;
            } else {/* Error*/}
        });
    }

    buildMP3(fileName, fileBuffer) {
        if (this.ffmpegRunning) {
            this.ffmpegWorker.terminate();
            this.ffmpegWorker = this.getFFMPEGWorker();
        }

        this.ffmpegRunning = true;
        var fileNameExt = fileName.substr(fileName.lastIndexOf('.') + 1);
        var outFileName = fileName.substr(0, fileName.lastIndexOf('.')) + "." + "mp3";
        var _arguments = [];
        _arguments.push("-i");
        _arguments.push(fileName);
        _arguments.push("-b:a");
        _arguments.push('128k');
        _arguments.push("-acodec");
        _arguments.push("libmp3lame");
        _arguments.push("out.mp3");

        this.ffmpegWorker.postMessage({
            type: "command",
            arguments: _arguments,
            files: [{
                "name": fileName,
                "buffer": fileBuffer
            }]
        });
    }

    getFFMPEGWorker() {

        var response = "importScripts('https://cdn.criptext.com/MonkeyUI/scripts/ffmpeg.js');function print(text) {postMessage({'type' : 'stdout', 'data' : text});}function printErr(text) {postMessage({'type' :'stderr', 'data' : text});}var now = Date.now; onmessage = function(event) { var message = event.data; if (message.type === \"command\") { var Module = { print: print, printErr: print, files: message.files || [], arguments: message.arguments || [], TOTAL_MEMORY: message.TOTAL_MEMORY || false }; postMessage({ 'type' : 'start', 'data' : Module.arguments.join(\" \")}); postMessage({ 'type' : 'stdout', 'data' : 'Received command: ' + Module.arguments.join(\" \") + ((Module.TOTAL_MEMORY) ? \".  Processing with \" + Module.TOTAL_MEMORY + \" bits.\" : \"\")}); var time = now(); var result = ffmpeg_run(Module); var totalTime = now() - time; postMessage({'type' : 'stdout', 'data' : 'Finished processing (took ' + totalTime + 'ms)'}); postMessage({ 'type' : 'done', 'data' : result, 'time' : totalTime});}};postMessage({'type' : 'ready'});";

        window.URL = window.URL || window.webkitURL;
        var blobWorker;
        try {
            blobWorker = new Blob([response], { type: 'application/javascript' });
        } catch (e) {
            // Backwards-compatibility
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            blob = new BlobBuilder();
            blob.append(response);
            blob = blob.getBlob();
        }

        var ffmpegWorker = new Worker(URL.createObjectURL(blobWorker));
        var that = this;
        ffmpegWorker.onmessage = function (event) {
            var message = event.data;

            if (message.type === "ready" && window.File && window.FileList && window.FileReader) {} else if (message.type == "stdout") {
                // console.log(message.data);
            } else if (message.type == "stderr") {} else if (message.type == "done") {
                    var code = message.data.code;
                    var outFileNames = Object.keys(message.data.outputFiles);

                    if (code == 0 && outFileNames.length) {

                        var outFileName = outFileNames[0];
                        var outFileBuffer = message.data.outputFiles[outFileName];
                        var mp3Blob = new Blob([outFileBuffer]);
                        // var src = window.URL.createObjectURL(mp3Blob);
                        that.readData(mp3Blob);
                    } else {
                        console.log('hubo un error');
                    }
                }
        };
        return ffmpegWorker;
    }

    readData(mp3Blob) {
        // read mp3 audio
        var that = this;
        FileAPI.readAsDataURL(mp3Blob, function (evt) {
            if (evt.type == 'load') {
                // disabledAudioButton(false);
                //var dataURL = evt.result;
                var _src = evt.result;
                var _dataSplit = _src.split(',');
                var _data = _dataSplit[1];
                that.audioCaptured.src = 'data:audio/mpeg;base64,' + _data;
                that.audioCaptured.monkeyFileType = 1;
                that.audioCaptured.oldId = that.audioMessageOldId;
                that.audioCaptured.type = 'audio/mpeg';

                let message = {data: that.audioCaptured.src, bubbleType: 'audio', preview: 'Audio', length:that.audioCaptured.duration};
                that.props.messageCreated(message);
                that.setState({creatingAudio: false});

            } else if (evt.type == 'progress') {
                var pr = evt.loaded / evt.total * 100;
            } else {/*Error*/}
        });
    }

    pauseAllAudio() {
	    clearInterval(window.playIntervalBubble);
	    var that = this;
        document.addEventListener('play', function(e){
            var audios = document.getElementsByTagName('audio');
            for(var i = 0, len = audios.length; i < len;i++){
                if(audios[i] != e.target){
                    audios[i].pause();
                    $('.mky-bubble-audio-button').hide();
                    $('.mky-bubble-audio-play-button').show();
                }
            }
        }, true);
    }

    handleAttach() {
        this.handleMenuVisibility();
	    this.refs.dropzone.open();
    }

    onDrop(files) {
		let _file;
	    files.map((file) => (_file = file))
		this.catchUpFile(_file);
    }

    catchUpFile(file) {
        this.generateDataFile(file);
    }

    generateDataFile(file) {
        if(file.size <= 5000000){
            FileAPI.readAsDataURL(file, (evt) => {
                if( evt.type == 'load' ){
    	            let message = {
    	                filename: file.name,
    	                filesize: file.size,
    	                mimetype: file.type
                	}
    				message.data = evt.result;
    	            let type = this.checkExtention(file);
    	            switch(type){
    		            case 1:{
    			            message.bubbleType = 'image';
    			            message.preview = 'Image';
    			            break;
    		            }
    		            case 2:{
    			            message.bubbleType = 'file';
    			            message.preview = 'File';
    			            break;
    		            }
    	            }
    				this.props.messageCreated(message);
                }
            });
        }
        else{
            this.refs.container.warning(
              "",
              "File size limit is 5MB", {
              timeOut: 5000,
              extendedTimeOut: 0
            });
        }
    }

    checkExtention(files) {
        var ft=0;  //fileType by extention

        var file=["doc","docx","pdf","xls", "xlsx","ppt","pptx"];
        var img=["jpe","jpeg","jpg","png","gif"]; //1

        var extension = getExtention(files.name);

        if(img.indexOf(extension)>-1){
            ft=1;
        }else if(file.indexOf(extension)>-1){
	        ft=2;
        }

        return ft;
    }
}

export default Input;
