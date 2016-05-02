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
          position: props.myPosition,
          showInfo: true,
          content: "You're Here"
        },
        {
          position: props.yourPosition,
          showInfo: true,
          content: props.address
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
    this.setState({
      bounds : bounds
    })
  }

  componentDidUpdate() {
    console.log('the map: ' + this.refs.map);
    this.refs.map.fitBounds(this.state.bounds);
  }

  render() {
    console.log("gg");
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
                    <InfoWindow key={index} position={marker.position}>
                      <div> {marker.content} </div>
                    </InfoWindow>
                );    
              } 
            )} 
          </GoogleMap>
        }
      />
    );
  }
}

