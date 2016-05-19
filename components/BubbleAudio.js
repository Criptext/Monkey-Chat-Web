import React, { Component } from 'react'

var playIntervalBubble;
var $bubblePlayer;

class BubbleAudio extends Component {
	constructor(props) {
		super(props);
		this.messageId = (this.props.message.id[0] == '-' ? (this.props.message.datetimeCreation) : this.props.message.id);
		this.state = {
			disabledClass: 'mky-disabled',
			minutes: '00',
			seconds: '00'
		}
		this.playAudioBubble = this.playAudioBubble.bind(this);
		this.pauseAudioBubble = this.pauseAudioBubble.bind(this);
		this.pauseAllAudio = this.pauseAllAudio.bind(this);
		this.updateAnimationBuble = this.updateAnimationBuble.bind(this);
	}
	
	componentWillMount() {		
        if(this.props.message.data == null && !this.props.message.isDownloading){
            this.props.dataDownloadRequest(this.props.message.mokMessage);
            this.props.message.isDownloading = true;
        }
	}
	
	render() {
		return (
            <div className={'mky-content-audio'}>
                { this.props.message.data
	                ? (
                    	<div className={'mky-content-audio-data'}>
	                        <img id={'mky-bubble-audio-play-button-'+this.messageId} className={'mky-bubble-audio-button mky-bubble-audio-button-'+this.messageId+' mky-bubble-audio-play-button'} onClick={this.playAudioBubble} src='https://cdn.criptext.com/MonkeyUI/images/playAudioButton.png'></img>
	                        <img id={'mky-bubble-audio-pause-button-'+this.messageId} className={'mky-bubble-audio-button mky-bubble-audio-button-'+this.messageId+' mky-bubble-audio-pause-button'} onClick={this.pauseAudioBubble} src='https://cdn.criptext.com/MonkeyUI/images/pauseAudioButton.png'></img>
	                        <input id={'bubble-audio-player-'+this.messageId} className='knob second'></input>
	                        <div className='mky-bubble-audio-timer'>
	                            <span>{this.state.minutes}</span><span>:</span><span>{this.state.seconds}</span>
	                        </div>
	                        <audio id={'audio_'+this.messageId} preload='auto' controls='' src={this.props.message.data}></audio>
						</div>
                    )
                    : (
                        <div className='mky-content-audio-loading'>
                            <div className='mky-double-bounce1'></div>
                            <div className='mky-double-bounce2'></div>
                        </div>
                    )
                }
            </div>
		)
	}
	
	componentDidMount() {
		$('#mky-bubble-audio-play-button-'+this.messageId).show();
		$('#mky-bubble-audio-pause-button-'+this.messageId).hide();
		
		//this.createAudioHandlerBubble(this.messageId,Math.round(this.props.message.length));
		//this.createAudioHandlerBubble(this.messageId,Math.round(this.props.message.duration));

        let mkyAudioBubble = document.getElementById("audio_"+this.messageId);
        var that = this;
        
        if(mkyAudioBubble){
	        mkyAudioBubble.oncanplay = function() {
                that.createAudioHandlerBubble(that.messageId,Math.round(mkyAudioBubble.duration));
                that.setDurationTime(that.messageId);
//                     that.setState({disabledClass: ''});
            }
        }
	}
	
	createAudioHandlerBubble(timestamp, duration) {
		$("#bubble-audio-player-"+timestamp).knob({
            'min': 0,
            'max': duration,
            'angleOffset': -133,
            'angleArc': 265,
            'width': 100,
            'height': 90,
            'displayInput':false,
            'skin':'tron',
            'fgColor': '#0276a9',
            'thickness': 0.7,
            change : function (value) {
            }
        });
	}
	
	setDurationTime(timestamp) {
        let mkyAudioBubble = document.getElementById("audio_"+timestamp);
        let durationTime= Math.round(mkyAudioBubble.duration);
        let seconds = ("0" + durationTime%60).slice(-2);
        this.setState({seconds: seconds});
        let minutes = ("0" + parseInt(durationTime/60)).slice(-2);
        this.setState({minutes: minutes});
    }
    
    playAudioBubble() {
	    this.pauseAllAudio();
        window.$bubblePlayer = $("#bubble-audio-player-"+this.messageId); //handles the circle
        $('#mky-bubble-audio-play-button-'+this.messageId).hide();
        $('#mky-bubble-audio-pause-button-'+this.messageId).show();
        let audiobuble = document.getElementById("audio_"+this.messageId);
        audiobuble.play();
        window.playIntervalBubble = setInterval(this.updateAnimationBuble,1000);
        var that = this;
        audiobuble.addEventListener("ended",function() {
            that.setDurationTime(that.messageId);
            window.$bubblePlayer.val(0).trigger("change");
			$('#mky-bubble-audio-play-button-'+that.messageId).show();
			$('#mky-bubble-audio-pause-button-'+that.messageId).hide();
            clearInterval(window.playIntervalBubble);
        });
    }
    
    pauseAudioBubble() {
		$('#mky-bubble-audio-play-button-'+this.messageId).show();
		$('#mky-bubble-audio-pause-button-'+this.messageId).hide();
		let audiobuble = document.getElementById("audio_"+this.messageId);
        audiobuble.pause();
        clearInterval(window.playIntervalBubble);
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
            $('#mky-bubble-audio-play-button-'+that.messageId).hide();
			$('#mky-bubble-audio-pause-button-'+that.messageId).show();
        }, true);
    }
    
    updateAnimationBuble() {
	    let audiobuble = document.getElementById("audio_"+this.messageId);
        var currentTime = Math.round(audiobuble.currentTime);
        window.$bubblePlayer.val(currentTime).trigger("change");
        let seconds = ("0" + currentTime%60).slice(-2);
        this.setState({seconds: seconds});
        let minutes = ("0" + parseInt(currentTime/60)).slice(-2);
        this.setState({minutes: minutes});
    }
}

export default BubbleAudio;