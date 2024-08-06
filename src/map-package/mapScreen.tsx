import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, SafeAreaView, Button , Modal ,TextInput, Text} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {mapScreenStyle, mapStyle} from './mapScreenStyle';
import MapView, {Marker, Polyline,Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';
import { TouchableOpacity, StyleSheet, View,  ActivityIndicator} from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import GeoPoint from '@react-native-firebase/firestore';
import { FlatList } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getDistance } from 'geolib';

type MapScreenProps = {} & WithNavigation;

// THE GOOGLE API KEY: AIzaSyCb63VHAQyLVa5BkcJDuqlZQbiUqp-nUIs
// THIS IS FOR THE GooglePlacesAutocomplete
//INTERFACES
  // represents the array of Geopoints for each doc
  interface GeoPointData {
  latitude: number;
  longitude: number;
  }
  // represents the whole doc in the db
  interface RouteData {
  route: GeoPointData[];
  difficulty: number;
  name: string;
  }

  interface RouteWithDistance extends RouteData {
    distance: number;
  }

//const [routes, setRoutes] = useState<Array<Array<Geopoint>>>([]);

const extractedRoutes: RouteData[] = [];

useEffect(() => {
  //fetchRoutes();
}, []);

export const MapScreen: React.FC<MapScreenProps> = props => {
  
  //ADDING TOOLS FOR TRACKING USER LOCATION
  const [tracking, setTracking] = useState<boolean>(false);
  const watchId = useRef<number | null>(null);

  //ADDING TOOLS FOR SEARCH BAR
  const [selectedLocation, setSelectedLocation] = useState<GeoPointData | null>(null);
  const [filteredData, setFilteredData] = useState<RouteWithDistance[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  // variable for popup modal 
  const [modalVisible, setModalVisible] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDifficulty, setRouteDifficulty] = useState('');

  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  // State variable to store tracked GeoPoints
  const [trackedGeoPoints, setTrackedGeoPoints] = useState<GeoPointData[]>([]);

  // current selected route
  const [selectedRoute, setSelectedRoute] = useState<{
    route: GeoPointData[];
    difficulty: number;
    name: string;
  } | null>(null);

  const [showRoutes, setShowRoutes] = useState<boolean>(false);


//FUNCTIONS FOR DATABASE DATA
  
  //ADDING FUNC THAT TRACKING THE USER LOCATION
  const startTracking =() => {
      console.log("clicked on start tracking");
      if (watchId.current === null) {
        watchId.current = Geolocation.watchPosition(
          position => {
            console.log("made it");
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });

            // Update trackedGeoPoints with new GeoPoint
            setTrackedGeoPoints((prevGeoPoints) => [...prevGeoPoints, { latitude, longitude }]);
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005, // More zoomed-in value
              longitudeDelta: 0.005, // More zoomed-in value
            });
          },
          error => console.log(error),
          { enableHighAccuracy: true, distanceFilter: 0, interval: 1000 }
        );
        setTracking(true);
      }
  };

  //ADDING A FUNCTION THAT STOP THE TRACK ON THE USER LOCATION
  const stopTracking = () => {
      if (tracking && watchId.current !== null) {
        console.log(trackedGeoPoints);
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setTracking(false);
        setModalVisible(true);
      }
  };

  // Function to get the routes from the database
  const fetchRoutes = async () => {
      try {
        const routesCollection = await firestore().collection('routes').get();
        routesCollection.forEach(doc => {
          const data = doc.data() as RouteData;
          const route = doc.data().route; // Get the route from the document
  
          // print route from db
          console.log('route name (db)', data.name); // the current route name in the doc
          console.log('route (db)', route); // the current route in the doc
  
          const difficulty = doc.data().difficulty; // Get the difficulty from the document
          const name = doc.data().name; // Get the name from the document
  
          if (Array.isArray(route)) {
            const geopoints: Array<GeoPointData> = route.map((point: any) => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }));
  
            const simplifiedData = simplifyRoute(data) as RouteData;
            extractedRoutes.push(simplifiedData);
  
            // print route from array
            var size: number = extractedRoutes.length;
            console.log(
              'extractedRoutes name (array):',
              extractedRoutes[size - 1].name,
            );
            console.log(
              'extractedRoutes (array):',
              extractedRoutes[size - 1].route,
            );
          }
        });
        //  setRoutes(extractedRoutes);
        setShowRoutes(true);
        console.log(showRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
  };

  const handleLocationSelect = async (data: any, details: any) => {
    // Extract coordinates from details
    const { lat, lng } = details.geometry.location;
    const userLocation: GeoPointData = { latitude: lat, longitude: lng };
    console.log("details:");
    console.log(details);
    console.log("data:");
    console.log(data);
    console.log("userLocation:");
    console.log(userLocation);

    setSelectedLocation(userLocation);

    // Fetch and filter routes based on the selected location
    await fetchAndFilterRoutes(userLocation);
  };

  const fetchAndFilterRoutes = async (location: GeoPointData) => {
    try {
      const routesCollection = firestore().collection('routes') as FirebaseFirestoreTypes.CollectionReference<RouteData>;
      const querySnapshot = await routesCollection.get();
      const routes = querySnapshot.docs.map(doc => doc.data() as RouteData);

      // Calculate distances and sort routes
      const routesWithDistance: RouteWithDistance[] = routes.map(route => {
        const distance = route.route.reduce((minDist, point) => {
          const pointDistance = getDistance(location, point);
          return Math.min(minDist, pointDistance);
        }, Infinity);

        return { ...route, distance } as RouteWithDistance;
      });

      // Sort by distance and get top 3
      const sortedRoutes = routesWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
      setFilteredData(sortedRoutes);

    } 
    catch (error) {
      console.error(error);
    }
  };

//LOCATION

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
    //fetchRoutes();
  }, []); // Run once when the component mounts



//HANDLERS FOR BUTTONS AND OTHER INTERACTIVE COMPONENTS
  // showRoutes button function
  const showAllroutes = async () => {
    await fetchRoutes(); // Fetch the routes and update the state
    setShowRoutes(true);
    console.log(showRoutes);
  };

  // Function to handle polyline press
  const handlePolylinePress = (route: {
    route: GeoPointData[];
    difficulty: number;
    name: string;
  }) => {
    setSelectedRoute(route);
    Alert.alert(
      'Route Information',
      `Name: ${route.name}\nDifficulty: ${route.difficulty}`,
      [{text: 'OK'}],
    );

  };

  // handler for the add route button
  const handleAddRoute = () => {
    addRouteToFirestore(routeName, routeDifficulty);
    setModalVisible(false);
    setRouteName('');
    setRouteDifficulty('');
  };

  // adds the route to the firestore as a doc 
  // used after choosing a name and a difficulty
  const addRouteToFirestore = async (name: string, difficulty: string) => {
  try {
    const routeWithGeoPoints = trackedGeoPoints.map(point => 
      new firestore.GeoPoint(point.latitude, point.longitude)
    );

    await firestore()
      .collection('routes')
      .add({
        name,
        difficulty: parseInt(difficulty),
        route: routeWithGeoPoints
      });

    console.log('Route added!');
  } catch (error) {
    console.error('Error adding route: ', error);
  }
 };


  return (
    <SafeAreaView style={mapScreenStyle.mainWrapper}>
      <MapView
        style={mapScreenStyle.map}
        region={{
          latitude: location ? location.latitude : 37.78825,
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
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
        {extractedRoutes.map((data, index) => (
          <Polyline
            key={`route-${index}`}
            coordinates={data.route.map(geopoint => ({
              latitude: geopoint.latitude,
              longitude: geopoint.longitude,
            }))}
            strokeWidth={data.difficulty}
            strokeColor={getPolylineColor(index)}
            tappable={true}
            onPress={() => handlePolylinePress(data)}
          />
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button
          title={showRoutes ? 'Hide Routes' : 'Show Routes'}
          onPress={showAllroutes}
        />
        <Button title="Start Tracking" onPress={startTracking} />
        <Button title="Stop Tracking" onPress={stopTracking} />
       
        
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Enter Route Details</Text>
          <TextInput
            placeholder="Route Name"
            placeholderTextColor="#4E5476"
            value={routeName}
            onChangeText={setRouteName}
            style={styles.input}
          />
        <TextInput
           placeholder="Route Difficulty"
           placeholderTextColor="#4E5476"
           value={routeDifficulty}
           onChangeText={setRouteDifficulty}
           keyboardType="numeric"
           style={styles.input}
          />
          <Button title="Add Route" onPress={handleAddRoute}  />
        </View>
      </Modal>
      </View>
      {tracking && (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="large" color="#fffafa" />
        <Text style={styles.indicatorText}>Tracking...</Text>
      </View>
    )}
    <View style={styles.autocompleteContainer}>
       <GooglePlacesAutocomplete
        placeholder="Search for a place"
        fetchDetails={true}
        onPress={handleLocationSelect}
        query={{
          key: "AIzaSyCb63VHAQyLVa5BkcJDuqlZQbiUqp-nUIs",  
          language: 'en',
        }}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Route: {item.name}</Text>
            <Text style={styles.itemText}>Distance: {item.distance} meters</Text>
          </View>
        )}
      />
    </View>
    </SafeAreaView>
  );
};

// STYLES
const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    position: 'relative', // Ensure this is relative
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10, // Adjust bottom position as needed
    right: 10,
    backgroundColor: '#c7cbdd',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    color: 'red', // Change this to the desired color
    fontSize: 15,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#a8b3c4',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E5476',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black', // Text color
  },
  button: {
    backgroundColor: '#841584',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 10, // Adjust top position as needed
    left: 10, // Adjust left position as needed
    width: '90%', // Adjust width as needed
    zIndex: 2, // Ensure it's above other elements
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
 },
);

// colors cycle for the polylines
const getPolylineColor = (index: number): string => {
  const colors = ['#dc143c', '#00bfff', '#32cd32', '#ff1493', '#ffa500']; // Define your colors array
  const colorIndex = index % colors.length; // Use modulo to cycle through colors
  return colors[colorIndex];
};


// ROUTE "FIXING" FUNCTIONS
  function simplifyRoute(data: RouteData): RouteData {
  return {
    route: douglasPeucker(data.route, 0.0001),
    difficulty: data.difficulty,
    name: data.name,
  };
  }

  function douglasPeucker(
  points: GeoPointData[],
  epsilon: number,
): GeoPointData[] {
  if (points.length < 3) {
    return points;
  }

  let maxDistance = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = getPerpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1],
    );
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > epsilon) {
    const leftSegment = douglasPeucker(points.slice(0, index + 1), epsilon);
    const rightSegment = douglasPeucker(points.slice(index), epsilon);

    return leftSegment.slice(0, -1).concat(rightSegment);
  } else {
    return [points[0], points[points.length - 1]];
  }
  }

  function getPerpendicularDistance(
  point: GeoPointData,
  lineStart: GeoPointData,
  lineEnd: GeoPointData,
): number {
  const {latitude: x0, longitude: y0} = point;
  const {latitude: x1, longitude: y1} = lineStart;
  const {latitude: x2, longitude: y2} = lineEnd;

  const numerator = Math.abs(
    (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1,
  );
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  return numerator / denominator;
  }
