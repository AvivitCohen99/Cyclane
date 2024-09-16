import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, SafeAreaView, Button , Modal ,TextInput, Text} from 'react-native';
import {WithNavigation} from '../common';
import {mapScreenStyle, mapStyle} from './mapScreenStyle';
import MapView, {Marker, Polyline,Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';
import { TouchableOpacity, StyleSheet, View,  ActivityIndicator} from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { FlatList } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getDistance } from 'geolib';
import { LatLng } from 'react-native-maps';
import { Linking } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';


type MapScreenProps = {} & WithNavigation;

// THE GOOGLE API KEY: AIzaSyCb63VHAQyLVa5BkcJDuqlZQbiUqp-nUIs

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

  // refering to the Direction API
  interface RouteWithDistance extends RouteData {
    distance: number;
  }

const extractedRoutes: RouteData[] = [];

export const MapScreen: React.FC<MapScreenProps> = props => {
  
  //ADDING TOOLS FOR TRACKING USER LOCATION
  const [tracking, setTracking] = useState<boolean>(false);
  const watchId = useRef<number | null>(null);

  //ADDING TOOLS FOR SEARCH BAR
  const [selectedLocation, setSelectedLocation] = useState<GeoPointData | null>(null);
  const [filteredData, setFilteredData] = useState<RouteWithDistance[]>([]);
  const [showFlatList, setShowFlatList] = useState(true);

  // variable for popup modal 
  const [modalVisible, setModalVisible] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDifficulty, setRouteDifficulty] = useState('');

  // State variable to store tracked GeoPoints
  const [trackedGeoPoints, setTrackedGeoPoints] = useState<GeoPointData[]>([]);

  // current selected route
  const [selectedRoute, setSelectedRoute] = useState<{
    route: GeoPointData[];
    difficulty: number;
    name: string;
  } | null>(null);

  //Directions consts 
  const [origin, setOrigin] = React.useState<LatLng>({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  
  const [destination, setDestination] = React.useState<LatLng>({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  //The current step in the route 
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  //The current step index in the steps array
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

  // State variables to show the routes on the map
  const [showRoutes, setShowRoutes] = useState<boolean>(false);
  const [displayedRoutes, setDisplayedRoutes] = useState(extractedRoutes);

  // Show the route from the user location to the start of the selected bicycle route
  const[showRouteToStart,setShowRouteToStart]=useState<boolean>(false);
  
  const [distance, setDistance] = useState(0);
  
  const [duration, setDuration] = useState(0);
  
  //State varible for taking the map view to a area that the user have choosed
  const mapRef = useRef<MapView>(null);

  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  

//FUNCTIONS FOR DATABASE DATA
    // Fetching the routes from the DB
    const fetchRoutes = async () => {
      try {
        const routesCollection = await firestore().collection('routes').get();
        routesCollection.forEach(doc => {
          const data = doc.data() as RouteData;
          const route = doc.data().route; // Get the route from the document
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
        setShowRoutes(true);
        console.log(showRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
  };

  //FUNCTIONS FOR DIRECTIONS
  const updateDestination = () => {
    if (selectedRoute) {
      console.log(selectedRoute);
      if (currentWaypointIndex < selectedRoute.route.length - 1) {
        const nextWaypoint = selectedRoute.route[currentWaypointIndex + 1];
        setDestination(nextWaypoint); // Update destination to the next waypoint
        console.log("setDestination in updateDest " + nextWaypoint);
        setCurrentWaypointIndex(currentWaypointIndex + 1); // Move to the next waypoint
      } else {
        // When all waypoints are covered, stop navigation
        setShowRouteToStart(false);
        Alert.alert('You have reached your destination');
      }
    }
  };

// Call this function when the user reaches the current destination
const checkProximityToWaypoint = () => {
  if (location && selectedRoute) {
    const distanceToNextWaypoint = getDistance(
      location,
      selectedRoute.route[currentWaypointIndex]
    );

    if (distanceToNextWaypoint < 50) { 
      updateDestination(); // Call updateDestination to move to the next point
    }
  }
};
  
// Call this periodically to check the proximity
useEffect(() => {
  if (selectedRoute) {  // Only start checking when a route is selected
    console.log("Proximity checking started");
    const interval = setInterval(checkProximityToWaypoint, 1000); // Adjust the interval if needed
    return () => clearInterval(interval); // Clean up on unmount
  }
    
}, [location, currentWaypointIndex, selectedRoute]);

  //FUNCIONS FOR TRACKING THE USER LOCATION
  // Start tracking the user location
  const startTracking =() => {
      console.log("clicked on start tracking");
      if (watchId.current === null) {
        watchId.current = Geolocation.watchPosition(
          position => {
            console.log("Tracking");
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

  // Stop tracking the user location
  const stopTracking = () => {
      if (tracking && watchId.current !== null) {
        console.log("The points that have been tracked:")
        console.log(trackedGeoPoints);
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setTracking(false);
        setModalVisible(true);
      }
  };

//FUNCTIONS FOR SEARCHING ROUTS
  const handleLocationSelect = async (data: any, details: any) => {
    // Extract coordinates from details
    const { lat, lng } = details.geometry.location;
    const userLocation: GeoPointData = { latitude: lat, longitude: lng };

    setSelectedLocation(userLocation);

    // Fetch and filter routes based on the selected location
    await fetchAndFilterRoutes(userLocation);
  };

  const fetchAndFilterRoutes = async (location: GeoPointData) => {
    try {
      const querySnapshot = await firestore().collection('routes').get();
      const routes = querySnapshot.docs
        .map(doc => doc.data() as RouteData)
        .filter(routeData => routeData.route.length > 0) // Skip routes with empty arrays
        .map(routeData => {
          const firstPoint = routeData.route[0];
          const distance = getDistance(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: firstPoint.latitude, longitude: firstPoint.longitude }
          );
          return { ...routeData, distance };
        });

        // Sort the routes by distance and take the closest 3
      const closestRoutes = routes.sort((a, b) => a.distance - b.distance).slice(0, 3);
 
      //return closestRoutes;
      setShowFlatList(true);
      setFilteredData(closestRoutes);

    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  };
       
  // Handle route selected by the user from the search bar
  const handleRoutePress = (item: RouteWithDistance) => {
    console.log("Item pressed:", item);
    setSelectedRoute(item);  
    setShowFlatList(false);
    const firstPoint = item.route[0];

    // Set the first waypoint for the directions
    if (location) {
      setOrigin(location); // Current location is the origin
      setDestination(firstPoint); // Set the first point as the destination
      console.log("setDestination in hadnleRoutePress" + firstPoint);
      setCurrentWaypointIndex(0);
      setShowRouteToStart(true); // Enable showing directions
    }
  
    // Animate to the first point of the selected route
    if (mapRef.current && item.route && item.route.length > 0) {
      mapRef.current.animateToRegion({
        latitude: firstPoint.latitude,
        longitude: firstPoint.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

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
  },[]); // Run once when the component mounts


  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000); // Animation duration in milliseconds
    }
  }, [location]); // Taking the map view to the current user location

// Fecthing route from the diretion API 
  const fetchDirections = async (startLocation: GeoPointData, endLocation: GeoPointData) => {
    const apiKey = "AIzaSyCb63VHAQyLVa5BkcJDuqlZQbiUqp-nUIs";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}&mode=walking&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.routes.length) {
        const points = data.routes[0].overview_polyline.points;
        const steps = data.routes[0].legs[0].steps;
        return { points, steps };
      } else {
        console.error('No routes found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };

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
      [
        {
          text: 'OK',
          style: 'cancel', // This is the default OK button
        },
      ],
      { cancelable: true }
    );
  };
  
  // Fecthing the data from the diretion API route that was created
  const traceRouteOnReady = (args: any) => {
    console.log('Trace Route On Ready Args:', args); // Log the full object
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration);
      if (args.legs[0] && args.legs[0].steps.length > 0) {
        const firstStep = args.legs[0].steps[0].html_instructions;
        setCurrentStep(firstStep);  // Set the first instruction
      }
    }
  };

  // Function that send the user to google maps to direct him to the chosen route
  const navigateToRouteStart = (startPoint: GeoPointData) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${startPoint.latitude},${startPoint.longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

  // Handler for the 'add route' button
  const handleAddRoute = () => {
    addRouteToFirestore(routeName, routeDifficulty);
    setModalVisible(false);
    setRouteName('');
    setRouteDifficulty('');
  };

  // Adds the route to the firestore as a doc 
  // used after sumbiting the route data and press 'add route'
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
    ref={mapRef}
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
      {location && destination && showRouteToStart && (
  <MapViewDirections
    origin={location} // Current location is the origin
    destination={destination} // Destination is updated dynamically
    apikey={"AIzaSyCb63VHAQyLVa5BkcJDuqlZQbiUqp-nUIs"}
    strokeColor="#6644ff"
    strokeWidth={4}
    mode="BICYCLING" // Set travel mode to bicycle
    onReady={traceRouteOnReady}
  />
)}

       {/* Display only the selected route or all routes */}
{displayedRoutes.map((data, index) => (
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

    <View style={styles.infoBox}>
{distance && duration && currentStep ? (
  <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 10 }}>    
    {typeof currentStep === 'string' && (
    <Text>Instruction: {currentStep.replace(/<[^>]+>/g, '')}</Text> )}
    <Text>Distance: {(distance * 1609.34 / 1000).toFixed(2)} Kilometers</Text>
    <Text>Duration: {Math.ceil(duration)} min</Text>
  </View>
) : null}
</View>
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
    <View>
    {showFlatList && (
    
    <FlatList
      data={filteredData}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleRoutePress(item)}>
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>Route: {item.name}</Text>
          <Text style={styles.itemText}>Distance: {item.distance} meters</Text>
        </View>
        </TouchableOpacity>
      )}
    />)}
    </View>
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
    backgroundColor: '#c7cbdd',
  },
  infoBox: {
    position: 'absolute',
    top: 60,  // Adjust the top position as needed
    left: 10,
    right: 10,
    zIndex: 1000,  // Ensure it appears above other components
  },
 },
);

// colors cycle for the polylines
const getPolylineColor = (index: number): string => {
  const colors = ['#dc143c', '#00bfff', '#32cd32', '#ff1493', '#ffa500']; // Define your colors array
  const colorIndex = index % colors.length; // Use modulo to cycle through colors
  return colors[colorIndex];
};


// ROUTE "FIXING" FUNCTIONS - removing geo-points that not needed for the route 
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