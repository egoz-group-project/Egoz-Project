import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './firebase';

import DrawerContent from './DrawerContent';

import LoginScreen from './pages/Login/Login'; 
import Forum from './pages/Forum/Forum';
import Home from './pages/home/Home';
import Jobs from './pages/jobs/Jobs';
import About from './pages/About/About';
import SignUpScreen from './pages/Login/SignUp';
import Profile from './pages/myInfo/myInfo';
import EventsNavigator from './pages/events/EventsNavigator';
import Contact from './pages/contact/Contact';
import Memorial from './pages/memorial/memorial';
import Benefits from './pages/benefits/benefits';
import { Button } from 'react-native-elements';
import SignUpAuth from './pages/Login/SignUpAuth';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
console.log(Drawer)
export default function App() {
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
  }
  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if(user){
    return(
     <SignUpAuth></SignUpAuth>
    );
  };

  return (
    <NavigationContainer>
        <Drawer.Navigator drawerContent={props=><DrawerContent {...props}/>} screenOptions={{drawerPosition:'right'}}>
          <Drawer.Screen name='home' component={Home}  />
          <Drawer.Screen name='jobs' component={Jobs} />
          <Drawer.Screen name='about' component={About} />
          <Drawer.Screen name='forums' component={Forum} />
          <Drawer.Screen name='profile' component={Profile} />
          <Drawer.Screen name='calendar' component={EventsNavigator} />
          <Drawer.Screen name='Benefits' component={Benefits} />
          <Drawer.Screen name='Contact' component={Contact} />
          <Drawer.Screen name='Memorial' component={Memorial} />




          <Drawer.Screen options={{headerShown: false}} name='login' component={LoginScreen} />
        </Drawer.Navigator>

      </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})