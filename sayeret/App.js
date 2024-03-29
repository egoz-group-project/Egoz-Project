import 'react-native-gesture-handler';
import {ImageBackground, LogBox} from 'react-native';
import React, {useState, useEffect} from 'react';
import {I18nManager, StyleSheet} from 'react-native';
import CodePush from 'react-native-code-push';
import { NavigationContainer} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { auth, db } from './firebase';
import Logo from './assets/Images/login_logo.png';
import { collection,query,getDocs, where, deleteDoc, doc} from 'firebase/firestore';

import DrawerContent from './DrawerContent';

import LoginScreen from './pages/Login/Login'; 
import Forum from './pages/Forum/Forum';
import Home from './pages/home/Home';
import Jobs from './pages/jobs/Jobs';
import About from './pages/About/About';
import SignUp from './pages/Login/SignUp';
import Profile from './pages/myInfo/myInfo';
import EventsNavigator from './pages/events/EventsNavigator';
import Contact from './pages/contact/Contact';
import MemorialNavigator from './pages/memorial/MemorialNavigator';
import Benefits from './pages/benefits/benefits';
import Store from './pages/store/Store';
import ForgotPage from './pages/Login/ForgotPage';
import Admin from './pages/Admin/Admin';
import PayMember from './pages/memberPay/Membership';
import ManageNavigator from './pages/Manage/ManageNavigator'



const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

export default function App() {
  //forcing the app to be right to left
  if(!I18nManager.isRTL){
    I18nManager
    .changeLanguage(I18n.language === 'he' ? 'en' : 'he')
    .then(()=>{
      I18nManager.forceRTL(true);
    });
    CodePush.restartApp();
  }
  
  LogBox.ignoreLogs(['Setting a timer']);

  const [user, setUser] = useState();
  const [loading, setLoad] = useState(true);
  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
  }
  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    setTimeout(()=>setLoad(false),1000)
    return subscriber; // unsubscribe on unmount
  }, []);

  if(loading){
    return(
      <ImageBackground source={Logo} style={{width:'100%', height:'100%'}} resizeMode='contain'>
      </ImageBackground>
    )
  }
else{
  if(!user){
    return(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='login' component={LoginScreen} options = {{title: null}}/>
          <Stack.Screen name='SignUp' component={SignUp} options = {{title: null}}/>
          <Stack.Screen name='ForgotPage' component={ForgotPage} options = {{title: null}}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  const du = async()=>{
  const docSnap =await getDocs(query(collection(db, "denied"), where("userId","==", auth.currentUser.uid)))
  docSnap.forEach(docs=>{
    if (docs.data().userId == auth.currentUser.uid ) {
      auth.currentUser.delete().then(()=>{
      deleteDoc(doc(db,'denied', docs.id))
      alert("המנהל החליט למחוק אותך")}).catch(()=>auth.signOut());
      }})}

  du()
  return (
    <NavigationContainer>
        <Drawer.Navigator drawerContent={props=><DrawerContent {...props}/>} 
        screenOptions={{drawerPosition:'right', drawerIcon: ({transform: [{ rotate: '180deg'}]}), headerStyle: {
            backgroundColor: '#485260',
          }, headerRight: () => <PayMember/>}}>
          <Drawer.Screen name='home' component={Home} options = {{title: null}}/>
          <Drawer.Screen name='jobs' component={Jobs} options = {{title: null}}/>
          <Drawer.Screen name='about' component={About} options = {{title: null}}/>
          <Drawer.Screen name='forums' component={Forum} options = {{title: null}}/>
          <Drawer.Screen name='profile' component={Profile} options = {{title: null}}/>
          <Drawer.Screen name='calendar' component={EventsNavigator}options = {{title: null}}/>
          <Drawer.Screen name='Benefits' component={Benefits} options = {{title: null}}/>
          <Drawer.Screen name='Contact' component={Contact} options = {{title: null}}/>
          <Drawer.Screen name='Memorial' component={MemorialNavigator} options = {{title: null}}/>
          <Drawer.Screen name='store' component={Store} options = {{title: null}} />
          <Drawer.Screen name='admin' component={Admin} options = {{title: null}}/>
          <Drawer.Screen name='infoManage' component={ManageNavigator} options = {{title: null}}/>
        </Drawer.Navigator>
      </NavigationContainer>
  );
}
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
})