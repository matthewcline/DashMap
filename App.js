import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default class DashMap extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userLocation: {
        latitude: 6.1750836,
        longitude: -75.5840982,
      },
      locations: [{latitude: 6.1698102, longitude: -75.5893129,},{latitude: 6.2463562, longitude: -75.5899408,},],
    }
  }

  getMarker(location) {
    // return <MapView.Marker key={gym.pokeId}
    return <MapView.Marker
      image={require('./assets/userpin.png')}
      //onPress={this.onGymMarkerClicked.bind(this, gym)}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude
      }} />
  }

  render() {
    return (
      <View style={styles.mapContainer}>
        <MapView style={styles.map} ref="map"
          initialRegion={{
             latitude: this.state.userLocation.latitude,
             longitude: this.state.userLocation.longitude,
             latitudeDelta: 10.0922,
             longitudeDelta: 10.0421,
        }}>

        <MapView.Marker
            anchor={{x: 0.5, y: 0.5}}
            coordinate={this.state.userLocation}
            image={require('./assets/userpin.png')}
            title="You are here"
          />

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
});
