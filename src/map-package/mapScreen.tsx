import React, {useEffect, useState} from 'react';
import {Alert, Platform, SafeAreaView} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {mapScreenStyle, mapStyle} from './mapScreenStyle';
import MapView, {Marker , Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';
import { StyleSheet, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import GeoPoint from "@react-native-firebase/firestore";

type MapScreenProps = {} & WithNavigation;
interface Geopoint {
  latitude: number;
  longitude: number;
}

//const [routes, setRoutes] = useState<Array<Array<Geopoint>>>([]); // doesnt seem to work (routes doesnt get a value after using setRoutes)
const extractedRoutes: Array<Array<Geopoint>> = []; // the array that holds all the routes(which are also arrays of geopoints)
// in here we save all the routes from the firestore


// Function to get the routes from the database
const fetchRoutes = async () => {
  try {
    const routesCollection = await firestore().collection('routes').get();
    routesCollection.forEach((doc) => {
      const route = doc.data().route;
      console.log('route',route); // the current route in the doc 
      if (Array.isArray(route)) {
        const geopoints: Array<Geopoint> = route.map((point: any) => ({
          latitude: point.latitude,
          longitude: point.longitude,
        }
      ));
      console.log('geopoints inside if',geopoints) // just to check if the geopoints inserted currectly from the doc
        extractedRoutes.push(geopoints);
        console.log('extractedRoutes',extractedRoutes);
      }
    });
  //  setRoutes(extractedRoutes); // doesnt seem to work 
    console.log('extractedRoutes',extractedRoutes)
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };


useEffect(() => {
    fetchRoutes();
  }, []);

export const MapScreen: React.FC<MapScreenProps> = props => {
  // location
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
      
        {/* Display a Polyline representing the custom routes */}
        {extractedRoutes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            coordinates={route}
            strokeWidth={4}
            strokeColor={getPolylineColor(index)}
          />
        ))}
        
      </MapView>
    </SafeAreaView>
  );
};

// colors cycle for the polylines
const getPolylineColor = (index: number): string => {
  const colors = ['#dc143c', '#00bfff', '#32cd32', '#ff1493', '#ffa500']; // Define your colors array
  const colorIndex = index % colors.length; // Use modulo to cycle through colors
  return colors[colorIndex];
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
