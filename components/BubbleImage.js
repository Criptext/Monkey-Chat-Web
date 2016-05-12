import React, { Component } from 'react'

class BubbleImage extends Component {
	constructor(props) {
		super(props);

		this.openImage = this.openImage.bind(this);
	}
	
	render() {
		return (
			<div>
				{ this.props.message.data
					? (
						<div className="mky-content-image">
							<img src={this.props.message.data} onClick={this.openImage}></img>
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

	openImage(){
		this.props.messageSelected(this.props.message);
	}
}

export default BubbleImage;