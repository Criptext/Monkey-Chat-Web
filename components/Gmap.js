import React, {PropTypes, Component} from 'react';

import { GoogleMapLoader, GoogleMap, Marker } from "react-google-maps";

export default class SimpleMapPage extends Component {



  constructor(props) {
    super(props);
    this.state = {
      lat: -2.1667,
      lng: -79.9000,
      animation: 1,
      opacity: 1
    }
  }

  setMarker(lat, lng){
    this.setState({
      lat : lat,
      lng: lng
    })
  }

  handleCenterChanged(){
    var coords = this.refs.map.getCenter();
    this.setMarker(coords.lat(), coords.lng());
    this.setState({
      animation: 0,
      opacity: 0.5
    })
  }

  handleIdle(){
    console.log("gg2");
    this.setState({
      animation: 1,
      opacity: 1
    })
  }

  render() {
    return (
       <GoogleMapLoader ref="maploader"
        containerElement={
          <div
            {...this.props}
            style={{
              height: `100%`,
              width: `100%`,
              zIndex: 1000,
            }}
          />
        }
        googleMapElement={
          <GoogleMap
            ref="map"
            onCenterChanged={this.handleCenterChanged.bind(this)}
            onIdle={this.handleIdle.bind(this)}
            defaultZoom={17}
            defaultCenter={{lat: this.state.lat, lng: this.state.lng}}
          >
            <Marker
              position={{lat: this.state.lat, lng: this.state.lng}} ref="myMarker" animation={this.state.animation} opacity={this.state.opacity }
            />
          </GoogleMap>
        }
      />
    );
  }
}