import React, { Component } from 'react'
import { getExtention } from '../utils/monkey-utils.js'

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
							<Fileicon classFileType={this.defineFileType(this.props.message.filename)} />
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

	defineFileType(filename) {
        let ft;  //fileType by extention
		let pdf = ['pdf'];
		let doc = ['doc', 'docx'];
		let xls = ['xls', 'xlsx'];
		let ppt = ['ppt', 'pptx'];
		let gif = ['gif'];

        let extension = getExtention(filename);

		if (pdf.indexOf(extension)>-1){
			ft = 'pdf'
		}else if (doc.indexOf(extension)>-1){
        ft = 'word';
    }else if(xls.indexOf(extension)>-1){
      ft = 'exel';
    }else if(ppt.indexOf(extension)>-1){
      ft = 'ppt';
    }else {
   	   ft = 'file';
    }

        return 'mky-file-'+ft+'-icon';
    }
}

const Fileicon = ({classFileType}) => (
	<div className={'mky-file-icon '+classFileType}></div>
);

export default BubbleFile;
