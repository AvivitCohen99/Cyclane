import React, {useEffect, useState} from 'react';
import {Alert, Platform, SafeAreaView} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {mapScreenStyle, mapStyle} from './mapScreenStyle';
import MapView, {Marker , Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';
import { StyleSheet, View } from 'react-native';


type MapScreenProps = {} & WithNavigation;

const routeCoordinates = [
  { latitude: 32.047215, longitude: 34.760438 }, // Start point
  { latitude: 32.051396, longitude: 34.761771 },  // Waypoint 1
  { latitude: 32.050829, longitude: 34.748971 },  // Waypoint 2
  { latitude: 32.068859, longitude: 34.769398 }, // End point (return to start)
];

const routeCoordinates2 = [
  { latitude: 32.504717,  longitude: 34.912955 }, // Start point
  { latitude: 32.503121, longitude: 34.905046 },  // Waypoint 1
  { latitude: 32.511429, longitude: 34.897651 },  // Waypoint 2
  { latitude: 32.514716, longitude: 34.897839 }, // End point (return to start)
];
const routeCoordinates3 = [
  { latitude: 32.489999,  longitude: 34.903373 }, // Start point
  { latitude: 32.502926, longitude: 34.904756 },  // Waypoint 1
  { latitude: 32.506899, longitude: 34.903635 },  // Waypoint 2
  { latitude: 32.518878, longitude: 34.907186 }, // End point (return to start)
];


export const MapScreen: React.FC<MapScreenProps> = props => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Function to get permission for location
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Geolocation Permission',
            message: 'Can we access your location?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use Geolocation');
          return true;
        } else {
          console.log('You cannot use Geolocation');
          return false;
        }
      } else {
        const result = await Geolocation.requestAuthorization('whenInUse');
        return result === 'granted';
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  // Function to get current location
  const getLocation = async () => {
    const permissionGranted = await requestLocationPermission();
    if (permissionGranted) {
      Geolocation.getCurrentPosition(
        position => {
          console.log('Current position:', position);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error('Error getting current position:', error);
          setLocation(null);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, []); // Run once when the component mounts

  return (
    <SafeAreaView style={mapScreenStyle.mainWrapper}>
      <MapView
        style={mapScreenStyle.map}
        region={{
          latitude: location ? location.latitude : 37.78825,
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        
        customMapStyle={mapStyle}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={'Current Location'}
            description={'This is the current location'}
          />
        )}
      
        {/* Display a Polyline representing the custom route */}
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={4}
          strokeColor="#00f"
        />
        <Polyline
          coordinates={routeCoordinates2}
          strokeWidth={4}
          strokeColor="#00008b"
        />
        <Polyline
          coordinates={routeCoordinates3}
          strokeWidth={4}
          strokeColor="#008000"
        />


      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
