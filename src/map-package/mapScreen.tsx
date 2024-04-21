import React from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, View} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {mapScreenStyle, mapStyle} from './mapScreenStyle';
import MapView, {Marker} from 'react-native-maps';

type MapScreenprops = {} & WithNavigation;

export const MapScreen: React.FC<MapScreenprops> = props => {
  return (
    <SafeAreaView style={mapScreenStyle.mainWrapper}>
      <MapView
        style={mapScreenStyle.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={mapStyle}>
        <Marker
          draggable
          coordinate={{
            latitude: 37.78825,
            longitude: -122.4324,
          }}
          onDragEnd={e => Alert.alert(JSON.stringify(e.nativeEvent.coordinate))}
          title={'Current Location'}
          description={'This is the current location'}
        />
        <Marker
          draggable
          coordinate={{
            latitude: 37.78915,
            longitude: -122.4324,
          }}
          onDragEnd={e => Alert.alert(JSON.stringify(e.nativeEvent.coordinate))}
          title={'Destination'}
          description={'This is your destination'}
          
        />
      </MapView>
    </SafeAreaView>
  );
};
