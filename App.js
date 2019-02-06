import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import Callout from 'react-native-maps';
import MyCustomMarkerView from './MyCustomMarkerView';

export default class DashMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      locations: [],
    }
  }

  onLocationMarkerClicked(selectedLocation) {
    this.setState({selectedLocation})
    this.refs.marker.showCallout()
    this.refs.map.animateToRegion({
      latitude: selectedLocation.location.lat,
      longitude: selectedLocation.location.lng,
      latitudeDelta: 0.01844,
      longitudeDelta: 0.01684,
    }, 400)
  }

  getMarker(location) {
    return <MapView.Marker key={location._id}
      ref="marker"
      image={require('./assets/dash.png')}
      onPress={this.onLocationMarkerClicked.bind(this, location)}
      coordinate={{
        latitude: location.location.lat,
        longitude: location.location.lng
      }}>
      <View>
      <Callout>
        <MyCustomMarkerView />
      </Callout>
      </View>
    </MapView.Marker>
  }

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; 
    var dLat = this.deg2rad(lat2-lat1); 
    var dLon = this.deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; 
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  onRegionChange(mapRegion) {
    let changeDistanceTreshold = true
    //Check change distance from the last mapRegion
    if (this.state.mapRegion) {
      lat1 = this.state.mapRegion.latitude
      lng1 = this.state.mapRegion.longitude
      lat2 = mapRegion.latitude
      lng2 = mapRegion.longitude
      const changeDistance = this.getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2)
      if (changeDistance < 5) {
        changeDistanceTreshold = false
      }
    }

    this.setState({mapRegion})
    clearTimeout(this.regionChangeTimeoutBounce)
    this.regionChangeTimeoutBounce = setTimeout(() => {
      if (!this.state.loading && !this.state.selectedLocation && changeDistanceTreshold) { 
        this.loadLocations(mapRegion)
      }
    }, 1300)
  }

  loadLocations(region) {
    this.setState({loading: true})
    let self = this
    const topLat = region.latitude - region.latitudeDelta
    const botLat = region.latitude + region.latitudeDelta
    const leftLng = region.longitude - region.longitudeDelta
    const rightLng = region.longitude + region.longitudeDelta

    let params = `${topLat}/${botLat}/${leftLng}/${rightLng}`
    fetch(`http://157.230.87.47/merchants/${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then((locations) => {
      self.showLocations(locations)
    }).catch((error) => {
      console.log('Load Locations Error', error)
      console.error(error);
    })
  }

  showLocations(locations) {
    this.setState({locations, loading: false})
  }

  render() {
    //console.log("rendered")
    return (
      <View style={styles.mapContainer}>
        <MapView style={styles.map} ref="map"
          onRegionChangeComplete={this.onRegionChange.bind(this)}
          initialRegion={{
             latitude: 6.1750836,
             longitude: -75.5840982,
             latitudeDelta: 8,
             longitudeDelta: 6,
        }}>
          {this.state.locations.map(location => (
              this.getMarker(location)
          ))}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customView: {
    width: 140,
    height: 100,
  },
});

//Adapted from: https://bitbucket.org/sambarboza/pokeping-rn/src/8acfd3e11d64aa84149251544ebddef2a5b3f1e1/Map.js?at=master&fileviewer=file-view-default
//Image from: https://iconscout.com/icon/dash-33