import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { WithNavigation } from '../common';
import { AppButton } from '../components/atom/appButton/appButton';
import { mapScreenStyle, mapStyle } from './mapScreenStyle';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

type MapScreenProps = {} & WithNavigation;

export const MapScreen: React.FC<MapScreenProps> = (props) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Function to get permission for location
  const requestLocationPermission = async () => {
    try {
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
        (position) => {
          console.log('Current position:', position);
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        (error) => {
          console.error('Error getting current position:', error);
          setLocation(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
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
      </MapView>
    </SafeAreaView>
  );
};
