import React, { Component } from 'react'

class BubbleImage extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
				{ this.props.message.data ? (
						<div className="mky-content-image">
							<img src={this.props.message.data}></img>
						</div>
					): (

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

export default BubbleImage;