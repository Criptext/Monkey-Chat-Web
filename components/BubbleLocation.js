import React, { Component } from 'react'

class BubbleLocation extends React.Component {
	constructor(props) {
		super(props);

		this.openMap = this.openMap.bind(this);
	}

	render() {
		return (
			<div className='mky-content-location'>
				<a target="_blank"  onClick={this.openMap}>
					<img src="images/gmap_default.png"></img>
					<div className='mky-location-detail'>
						<div className='mky-location-name'>
							<span className='mky-ellipsify'>Ver Mapa</span>
						</div>
					</div>
				</a>
			</div>
		)
	}

	openMap(){
		this.props.messageSelected(this.props.message);
	}
}

export default BubbleLocation;