import React, {PropTypes, Component} from 'react';
import SimpleMapPage from './Gmap.js';

export default class LocationInput extends Component {

	constructor(props) {
		super(props);
		this.state = {
			opacity: 0,
			lat: 0,
			lng: 0,
			address: ""
		}
	}

	getLocation(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition( (position) => {
				this.refs.googleMap.setMarker(position.coords.latitude, position.coords.longitude);
				this.refs.googleMap.setMapCenter(position.coords.latitude, position.coords.longitude);
				}, function (error) {
					var errors = { 
						1: 'Permission denied',
						2: 'Position unavailable',
						3: 'Request timeout'
					};
					alert("Error: " + errors[error.code]);
			});
		}else{
			console.log("Geolocation is not supported by this browser.");
		}
	}

	setOpacity(value){
		this.setState({opacity : value});
	}

	locationMessageInput(lat) {
		let message = {
			bubbleType: 5,
			text: this.state.address,
			preview: 'Location',
			lat: this.state.lat,
			lng: this.state.lng
		}
		this.props.messageCreated(message); 
		this.props.disableGeoInput();
	}

	updateGeoLocation(lat, lng, address){
		this.setState({
			lat : lat,
			lng : lng,
			address : address
		});
	}

	render() {
		return (
			<div style={{height: 'calc(100% - 86px)', width: '100%', zIndex: 1000,}}>
				<SimpleMapPage updateGeoLocation={this.updateGeoLocation.bind(this)} fireChangeEvent={this.setOpacity.bind(this)} ref="googleMap" />
				<div className="testing-location" onClick={this.getLocation.bind(this)}></div>
				<div className="quit-location" onClick={this.props.disableGeoInput}></div>
				<div className="send-location" onClick={this.locationMessageInput.bind(this)}></div>
				<div className="pin-location" style={{display: this.state.opacity ? "block" : "none"}}></div>
			</div>
		)
	}
}