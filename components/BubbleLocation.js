import React, { Component } from 'react'

class BubbleLocation extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='mky-content-location'>
				<a target="_blank" className='mky-location-link' href={"https://maps.google.com/maps?q=" + this.props.message.lat + "," + this.props.message.lon + "&amp;z=17"} >
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
}

export default BubbleLocation;