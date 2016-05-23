import React, { Component } from 'react'

class BubbleFile extends Component {
	constructor(props) {
		super(props);
		
		this.downloadData = this.downloadData.bind(this);
	}

	componentWillMount() {		
        if(this.props.message.data == null && !this.props.message.isDownloading){
            this.props.dataDownloadRequest(this.props.message.mokMessage);
            this.props.message.isDownloading = true;
        }
	}
	
	render() {
		return (
			<div>
			{ this.props.message.data 
				? (
					<div className='mky-content-file'>
						<a className='mky-file-link' href={this.props.message.data} download={this.props.message.filename}>
							<div className='mky-file-icon mky-icon-pdf'></div>
							<div className='mky-file-detail'>
								<div className='mky-file-name'>
									<span className='mky-ellipsify'>{this.props.message.filename}</span>
								</div>
								<div className='mky-file-size'>
									<span className='mky-ellipsify'>{this.humanFileSize(this.props.message.filesize, true)}</span>
								</div>
							</div>
						</a>
					</div>
				)
				: (
					<div className='mky-content-file-loading'>
                        <div className='mky-double-bounce1'></div>
                        <div className='mky-double-bounce2'></div>
                    </div>
				)

			}
			</div>
		)
	}
	
	downloadData() {
		this.props.onClickMessage(this.props.message);
	}

	humanFileSize(bytes, si) {
	    var thresh = si ? 1000 : 1024;
	    if(Math.abs(bytes) < thresh) {
	        return bytes + ' B';
	    }
	    var units = si
	        ? ['KB','MB','GB','TB','PB','EB','ZB','YB']
	        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
	    var u = -1;
	    do {
	        bytes /= thresh;
	        ++u;
	    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
	    return bytes.toFixed(1)+' '+units[u];
	}
}

export default BubbleFile;