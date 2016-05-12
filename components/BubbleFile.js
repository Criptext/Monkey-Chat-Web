import React, { Component } from 'react'

class BubbleFile extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
			{	this.props.message.data ? 
				(
					<div className='mky-content-file'>
						<a className='mky-file-link' href={this.props.message.data} download={this.props.message.filename}>
							<div className='mky-file-icon mky-icon-pdf'></div>
							<div className='mky-file-detail'>
								<div className='mky-file-name'>
									<span className='mky-ellipsify'>{this.props.message.filename}</span>
								</div>
								<div className='mky-file-size'>
									<span className='mky-ellipsify'>{this.props.message.filesize+' bytes'}</span>
								</div>
							</div>
						</a>
					</div>
				):(
					<div className='mky-content-audio-loading'>
                        <div className='mky-double-bounce1'></div>
                        <div className='mky-double-bounce2'></div>
                    </div>
				)

			}
			</div>
		)
	}
}

export default BubbleFile;