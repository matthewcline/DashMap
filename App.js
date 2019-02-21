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

  closeLocationDetails() {
    this.setState({selectedLocation: null})
  }

  onLocationMarkerClicked(selectedLocation) {
    console.log("onLocationMarkerClicked() called")
    this.setState({selectedLocation})
    this.refs.marker.showCallout()
    this.refs.map.animateToRegion({
      latitude: selectedLocation.place_details.result.geometry.location.lat,
      longitude: selectedLocation.place_details.result.geometry.location.lng,
      latitudeDelta: 0.01844,
      longitudeDelta: 0.01684,
    }, 400)
  }

  getMarker(location) {
    return <MapView.Marker key={location._id}
      ref="marker"
      onPress={this.onLocationMarkerClicked.bind(this, location)}
      coordinate={{
        latitude: location.place_details.result.geometry.location.lat,
        longitude: location.place_details.result.geometry.location.lng
      }} >
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
    console.log("onRegionChange() called")
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
      if (!this.state.loading && !this.state.selectedLocation) { 
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
    fetch(`https://directory.onedigital.cash/merchants/${params}`, {
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
          onPress={this.closeLocationDetails.bind(this)}
          onRegionChangeComplete={this.onRegionChange.bind(this)}
          initialRegion={{
             latitude: 6.1750836,
             longitude: -75.5840982,
             latitudeDelta: 0.0922,
             longitudeDelta: 0.0421
        }}>
          {this.state.locations.slice(0, 10).map(location => (
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
  viewStyle: {
    width: 200,
    height: 250,
    backgroundColor: "#fff",
    padding: 20
  },
  textStyle: {
    fontSize: 16,
    alignSelf: 'center',
    padding: 5
  },
});

//Adapted from: https://bitbucket.org/sambarboza/pokeping-rn/src/8acfd3e11d64aa84149251544ebddef2a5b3f1e1/Map.js?at=master&fileviewer=file-view-default
//Image from: https://iconscout.com/icon/dash-33