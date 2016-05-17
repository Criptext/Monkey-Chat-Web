import React, { Component } from 'react'

class BubbleImage extends Component {
	constructor(props) {
		super(props);

		this.openImage = this.openImage.bind(this);
		this.downloadData = this.downloadData.bind(this);
	}

	componentWillMount() {		
        if(this.props.message.data == null && !this.props.message.isDownloading){
            this.props.dataDownloadRequest(this.props.message.mokMessage);
            this.props.message.isDownloading = true;
        }
	}

	render() {
		// console.log(this.props.message);
		return (
			<div>
				{ this.props.message.data
					? (
						<div className="mky-content-image">
							<img src={this.props.message.data} onClick={this.openImage}></img>
						</div>
					):(
                        <div className='mky-content-image-loading'>
                            <div className='mky-double-bounce1'></div>
                            <div className='mky-double-bounce2'></div>
                        </div>
                    )
                }
			</div>
		)
	}

	openImage() {
		this.props.messageSelected(this.props.message);
	}

	downloadData() {
		this.props.onClickMessage(this.props.message.mokMessage);
	}
}

export default BubbleImage;
