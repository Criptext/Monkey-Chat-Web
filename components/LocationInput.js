import React, {PropTypes, Component} from 'react';
import Gmap from './Gmap.js';

export default class LocationInput extends Component {

  getLocation(){
    console.log('aqui casual');
    if (navigator.geolocation) {
        console.log('bien aqui casual');
        navigator.geolocation.getCurrentPosition( (position) => {
          console.log('vamo a localizar');
          console.log("latitude: " + position.coords.latitude + ", longitude: " + position.coords.longitude);
          this.refs.googleMap.setMarker(position.coords.latitude, position.coords.longitude);
          this.refs.googleMap.setMapCenter(position.coords.latitude, position.coords.longitude);
          console.log('bien 1!');
        }, function (error) {
          var errors = { 
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
          };
          alert("Error: " + errors[error.code]);
        });
        console.log('bien!');
    } else {
       console.log("Geolocation is not supported by this browser.");
    }
  }

  render() {
    return (
          <div style={{
              height: '100%',
              width: '100%',
              zIndex: 1000,
            }}
          >
            <Gmap ref="googleMap" />
            <div className="testing-location" onClick={this.getLocation.bind(this)}>
            </div>
          </div>
    );
  }
}