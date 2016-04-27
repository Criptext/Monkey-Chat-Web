import React, {PropTypes, Component} from 'react';

import { GoogleMapLoader, GoogleMap, Marker } from "react-google-maps";

export default class SimpleMapPage extends Component {



  constructor(props) {
    super(props);
    this.state = {
      lat: -2.1667,
      lng: -79.9000,
      animation: 1,
      opacity: 1,
      mapLat: -2.1667,
      mapLng: -79.9000
    }
  }

  setMarker(lat, lng){
    this.setState({
      lat : lat,
      lng: lng
    })
  }

  setMapCenter(lat, lng){
    this.setState({
      mapLat : lat,
      mapLng: lng
    })
  }

  handleCenterChanged(){
    var coords = this.refs.map.getCenter();
    this.setMarker(coords.lat(), coords.lng());
    this.setMapCenter(coords.lat(), coords.lng());
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
    console.log(this.refs.map);
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
            center={{lat: this.state.mapLat, lng: this.state.mapLng}}
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