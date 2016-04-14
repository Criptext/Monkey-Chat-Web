import React, { Component } from 'react'

class BubbleFile extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
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
		)
	}
}

export default BubbleFile;