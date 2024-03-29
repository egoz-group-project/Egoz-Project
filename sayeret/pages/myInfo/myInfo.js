import {React, useState} from "react";
import {TextInput, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

import { auth,db } from '../../firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UploadImage from "./uploadPhoto";
import { signOut} from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';


const signOutNow = () => {
    signOut(auth).then(() => {
        navigation.replace('login');
    }).catch((error) => {
    });
}

const Profile = (props) => {
    const [fnInput, setFnInput] = useState("");
    const [lnInput, setLnInput] = useState("");
    const [addInput, setAddInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [cityInput, setCityInput] = useState("");
    

    const user = props.route.params.user
    
    const handleSubmit = () => {
        
        let flag = false;

        if (fnInput!="") {
            updateDoc(doc(db,'users', user.id),{ FirstName:fnInput});
            flag = true
        }
        if (lnInput!="") {
            updateDoc(doc(db,'users', user.id),{ LastName:lnInput});
            flag = true
        }
        if (addInput!="") {
            updateDoc(doc(db,'users', user.id),{ Address:addInput});
            flag = true

        }
        if (cityInput!="") {
            updateDoc(doc(db,'users', user.id),{ city:cityInput});
            flag = true

        }
        if (phoneInput!="") {
            updateDoc(doc(db,'users', user.id),{ phone:phoneInput});
            flag = true

        }
        
        
        if (flag == true) {
            Alert.alert ("השינויים נשמרו בהצלחה")
        }
        else {
            Alert.alert ("לא נעשו שינויים")
        }
                
        props.navigation.navigate('home');
    }
    return ( 
        <KeyboardAwareScrollView>

        <View style = {styles.container}>   
            {/* profile picture view */}
            <View style = {styles.headName}>               
                <UploadImage user={user}/>
                <Text style = {{fontSize: 30, color: 'black',}}>{user.FirstName} {user.LastName}</Text>
            </View>
            
            {/* first name view */}
            <View style = {styles.itemLayout}>
            <Text style = {styles.textStyle}>שם פרטי: </Text>
                <TextInput 
                    style={styles.input}
                    placeholder={user.FirstName}
                    value = {fnInput}                    
                    placeholderTextColor={"grey"}
                    onChangeText={text=>setFnInput(text)}
                    />                
            </View>
            
            {/* last name view */}            
           <View style= {styles.itemLayout}>
           <Text style = {styles.textStyle}>שם משפחה: </Text>
                <TextInput placeholder={user.LastName} 
                    style={styles.input}
                    placeholderTextColor={"grey"}
                    value={lnInput}
                    onChangeText={text=>setLnInput(text)}
                />
                
            </View>

            {/* Address view */}
            <View style = {styles.itemLayout}>
            <Text style = {styles.textStyle}>כתובת: </Text>
                <TextInput placeholder={user.Address}
                    style={styles.input}
                    placeholderTextColor={"grey"}
                    value={addInput}
                    onChangeText={text=>setAddInput(text)}
                    />
            </View>

            {/* City view */}
            <View style = {styles.itemLayout}>
            <Text style = {styles.textStyle}>עיר: </Text>
                <TextInput placeholder={user.city}
                    style={styles.input}
                    placeholderTextColor={"grey"}
                    value={cityInput}
                    onChangeText={text=>setCityInput(text)}
                    />
            </View>

            {/* phone number view */}
            <View style = {styles.itemLayout}>
            <Text style = {styles.textStyle}>מספר פלאפון: </Text>
                <TextInput placeholder={user.phone}
                    style={styles.input}
                    keyboardType='phone-pad'
                    placeholderTextColor={"grey"}
                    value = {phoneInput}
                    onChangeText={text=>setPhoneInput(text)}
                    />                                    
            </View>

            
            {/* save changes button */}
            <TouchableOpacity style = {styles.buttons} onPress = {handleSubmit}>
                <Text style= {styles.buttonText} >שמירת שינויים</Text>
            </TouchableOpacity>

            {/* log out button */}
            <TouchableOpacity style = {styles.buttons} onPress={signOutNow}>
                <Text style= {styles.buttonText}>התנתק</Text>
            </TouchableOpacity>

        </View>
        </KeyboardAwareScrollView>
    );
};

export default Profile

const styles = StyleSheet.create ({
    container: {
        height: '200%',
        paddingBottom: 70, 
        width: "100%",
        display: 'flex',
        
    },

    headName: { 
        alignItems: 'center', 
        marginTop: 20, 
    },

    imageStyle: {
        height:120, 
        width:120, 
        backgroundColor:'white', 
        borderRadius:100,
    },

    itemLayout: {
        flexDirection: 'column',
        alignSelf: 'flex-end',
        width: '100%',
        alignContent: 'center',
        
    }, 

    textStyle: {
        fontSize: 17,
        paddingTop: 3,
        margin: 5,
        textAlign: 'left',
        
        
    },
    input: {
        height:40,
        borderRadius: 12,
        paddingRight:10,
        margin:5,
        paddingLeft: 7,
        borderWidth:1,
        textAlign: 'right',
        

     },
     buttons:{
        alignSelf:'center',
        alignItems:'center',
        width:'85%',
        color:'blue',
        height:40,
        backgroundColor:'#fff',
        marginTop:10,
        borderRadius:8,
        display:'flex',
        justifyContent:'center',
        // borderWidth: 1
        
        
     },
     buttonText:{
        color: "black",
        textAlign: 'center',
        fontWeight:"bold",
     
    },
     
});