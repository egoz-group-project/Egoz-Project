import {React, useEffect, useState} from "react";
import {TextInput, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import {db} from '../../firebase';
import { updateDoc, doc , query, collection, getDocs} from 'firebase/firestore';
import { SafeAreaView } from "react-native-safe-area-context";



const ManageInfo = (props) => {

    const [storeInput, setStoreInput] = useState("");
    const [memberInput, setMemberInput] = useState("");
    const [storeLink, setStoreLink] = useState("");
    const [memberLink, setMemberLink] = useState("");

    useEffect(async()=>{
        const q = query(collection(db,'edits'));
        const docs = await getDocs(q);
        docs.forEach(doc=>{
            const links = doc._document.data.value.mapValue.fields
            if(doc.id=='memberPayment'){
                setMemberLink(links.link.stringValue)
            }
            if(doc.id=='store'){
                setStoreLink(links.link.stringValue)
            }
        })
    },[])
    
    const handleSubmit = () => {
        let flag = false;

        if (storeInput!="") {
            updateDoc(doc(db,'edits','store') , {link:storeInput});
            flag = true
        }
        if (memberInput!="") {
            updateDoc(doc(db,'edits','memberPayment') , {link:memberInput});
            flag = true
        }
                
        if (flag == true) {
            Alert.alert ("השינויים נשמרו בהצלחה")
        }
        else {
            Alert.alert ("לא נעשו שינויים")
        }
        setStoreInput("")
        setMemberInput("")
        props.navigation.navigate('home');
    }


    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style = {styles.textStyle}> קישור חדש לאתר החנות: </Text>
                <TextInput 
                    style = {styles.input}
                    placeholder={storeLink}
                    value = {storeInput}                    
                    placeholderTextColor={"grey"}
                    onChangeText={text=>setStoreInput(text)}
                    />
            </View>

            <View style = {{paddingBottom: 20}}>
                <Text style = {styles.textStyle}>קישור חדש לאתר תשלום החברות: </Text>
                <TextInput 
                    style = {styles.input}
                    placeholder={memberLink}
                    value = {memberInput}                    
                    placeholderTextColor={"grey"}
                    onChangeText={text=>setMemberInput(text)}
                    />                    
            </View>
            

            {/* button to edit home page     */}
            <TouchableOpacity style = {styles.buttons} onPress={()=>props.navigation.navigate('HomeEdit')}>
                <Text style = {styles.buttonText}>לעריכת עמוד הבית</Text>
            </TouchableOpacity>

            {/* button to edit about page     */}
            {/* <TouchableOpacity style = {styles.buttons} onPress={()=>props.navigation.navigate("AboutEdit")}>
                <Text style = {styles.buttonText}>לעריכת עמוד האודות</Text>
            </TouchableOpacity>
         */}
            {/* save changes button */}
            <TouchableOpacity style = {styles.buttons} onPress = {handleSubmit}>
            
                <Text style= {styles.buttonText} >שמירת שינויים</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
    
}
export default ManageInfo

const styles = StyleSheet.create ({
    container: {
        height: '200%',
        paddingBottom: 70, 
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
        margin: 15,
        // borderWidth: 1
     },
     buttonText:{
        color: "black",
        textAlign: 'center',
        fontWeight:"bold",
     
    },
     
});