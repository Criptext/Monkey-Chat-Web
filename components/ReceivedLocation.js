import React, {PropTypes, Component} from 'react';

import { GoogleMapLoader, GoogleMap, Marker, InfoWindow } from "react-google-maps";

export default class ReceivedLocation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lat: -2.1667,
      lng: -79.9000,
      markers: [
        {
          position: props.yourPosition,
          content: props.address,
          animation: 0
        }  
      ]
    }
  }
  componentDidMount() {
    var bounds = new google.maps.LatLngBounds();
    this.state.markers.map((marker, index) =>
      {       
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(marker.position.lat, marker.position.lng),
        });

        bounds.extend(marker.position)
      }
    );
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( (position) => {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
          });
          bounds.extend(marker.position);
          var newMarker = {position: {lat: position.coords.latitude, lng: position.coords.longitude}, content: "You are here!", animation : 0}
          var newMarkers = this.state.markers;
          newMarkers.push(newMarker);
          this.setState({
            bounds : bounds,
            markers : newMarkers,
          })
        }, (error) => {
          this.setState({
            bounds : bounds
          })
        });
    } else {
      this.setState({
        bounds : bounds
      })
      console.log("Geolocation is not supported by this browser.");
    }
  }

  componentDidUpdate() {
    console.log('the map: ' + this.refs.map);
    this.refs.map.fitBounds(this.state.bounds);
  }

  render() {
    console.log("gg");
    var icon_color = 'http://i.stack.imgur.com/orZ4x.png';

    return (
      
       <GoogleMapLoader ref="maploader"
        containerElement={
          <div
            {...this.props}
            style={{
              height: `100%`,
              width: `100%`,
              zIndex: 1000,
              overflow: `visible !important`,
            }}

            id="map-id"
          />
        }
        googleMapElement={
          <GoogleMap
            ref="map"
            center={{lat: this.state.lat, lng: this.state.lng}}
            defaultZoom={15}
            defaultOptions={{ streetViewControl: false, mapTypeControl: false, zoomControlOptions: {position: google.maps.ControlPosition.RIGHT_BOTTOM} }}
          >
            {this.state.markers.map((marker, index) => 
              
              {             
                return ( 
                    <Marker 
                      key={index} position={marker.position} ref="myMarker" animation={marker.animation} icon={index==1 ? icon_color : ""}
                    />
                );    
              } 
            )} 
          </GoogleMap>
        }
      />
    );
  }
}

