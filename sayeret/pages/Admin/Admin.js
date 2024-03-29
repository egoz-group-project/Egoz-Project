import {SafeAreaView, StyleSheet,TextInput, Text, View, TouchableOpacity, FlatList, Modal, Alert } from 'react-native'
import React, {useEffect, useState} from 'react'
import {doc,collection, query, where, onSnapshot, updateDoc, deleteDoc, addDoc} from 'firebase/firestore'
import {db, storage} from '../../firebase'
import { ref, deleteObject } from 'firebase/storage'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Icons from 'react-native-vector-icons/Ionicons'

//accepts a new user
const accept = (id)=>{
  updateDoc(doc(db,'users',id),{'guest':false});
  return false;
} 

//removes a user from the app
const decline = (id, userId,pic)=>{
  Alert.alert(
    "למחוק?",
    "האם אתה בטוח שאתה רוצה למחוק את המשתמש הזה",
    [
      {
        text: "בטל",
        onPress: () => {return},
      },
      {
        text: "מחק",
        onPress: async () => {
            addDoc(collection(db,'denied'),{userId:userId});
            if(pic!=""){
              deleteObject(ref(storage,"profile/"+pic)).catch(()=>{})
            }
            await deleteDoc(doc(db, "users", id));
        },
    },
],
);

  return false;
}

//turns a user into an admin
const makeAdmin = (id)=>{
  updateDoc(doc(db,'users',id),{'isAdmin':true});
  return false;
}

//displays a guest
const GuestItem = props=>{
  const [visible, setVisiblity] = useState(false);
  return(
    <View>
      <View style = {styles.newUsers}>
      <Text> {props.name} </Text><Text> רוצה להצטרף </Text>
      <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(true)}>
        <Text style = {styles.buttensText}>פרטים נוספים</Text>
      </TouchableOpacity>
      </View>
      <Modal visible={visible} transparent={true}>
       <View style = {{backgroundColor: "rgba(0,0,0,0.5)", height: '100%'}}>
        <View style={styles.modal}>
        <View style={{alignSelf:'flex-start'}}>
        <TouchableOpacity style={styles.returnButten} onPress={()=>setVisiblity(false)}>
          <Icon name="arrow-right-thick" size={55}/>
        </TouchableOpacity>
      </View>
      
        <Text style = {styles.textStyle} >{props.name}</Text>
        <Text>שאלון אימות:</Text>
        <Text>שירת ביחידה: {props.questionaire.inUnit?"כן":"לא"}</Text>
        {props.questionaire.inUnit?
        <View>
        <Text>שנתון: {props.questionaire.year}</Text>
        <Text>מחזור: {props.questionaire.generation}</Text>
        <Text>צוות: {props.questionaire.team}</Text>
        </View>:
        <Text>סיבת הצטרפות: {props.questionaire.why}</Text>
        }

        <View style={{flexDirection:'row'}}>
          <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(accept(props.id))}>
            <Text style = {styles.buttensText}>אשר</Text>
          </TouchableOpacity>        
          <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(decline(props.id, props.userId, props.pic))}>
            <Text style = {styles.buttensText}>סרב</Text>
          </TouchableOpacity> 
        </View>
        </View>  
        </View>     
      </Modal>
    </View>
  );
}

//turns an admin into a normal user
const removeAdmin = id=>{
  updateDoc(doc(db,'users',id),{'isAdmin':false});
  return false;
}

//displays a user
const UserItem = props=>{
  const user = props.user
  const [visible,setVisiblity] = useState(false);
  return(
    <View style = {styles.newUsers}>
      <Text>{user.fname} {user.lname}</Text>
      <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(true)}>
        <Text style = {styles.buttensText}>פרטים נוספים</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent={true}>
        <View style = {{backgroundColor: "rgba(0,0,0,0.5)", height: '100%'}}>
          <View style={{...styles.modal,justifyContent:'flex-end'}}>
            <View style={{alignSelf:'flex-start'}}>
            <TouchableOpacity onPress={()=>setVisiblity(false)}>
              <Icon name="arrow-right-thick" size={55}/>
            </TouchableOpacity>
            </View>
              <Text style={{...styles.infoText, fontWeight:'bold', fontSize:30}}>{user.fname} {user.lname}</Text>
            <View>
              <Text style={styles.infoText}>פרטים</Text>
              <Text style={styles.infoText}>כתובת: {user.address}</Text>
              <Text style={styles.infoText}>עיר: {user.city}</Text>
              <Text style={styles.infoText}>אימייל: {user.email}</Text>
              <Text style={styles.infoText}>טלפון: {user.phone}</Text>
              <Text style={styles.infoText}>היה ביחידה: {user.questionaire.inUnit?"כן" : "לא"}</Text>
              </View>
              {props.admin?
              <View>
                <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(removeAdmin(user.id))}>
                  <Text style = {styles.buttensText}>הסר כמנהל</Text>
                </TouchableOpacity>
              </View>
              :
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(makeAdmin(user.id))}>
                  <Text style = {styles.buttensText}>הפוך למנהל</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.buttensStyle} onPress={()=>setVisiblity(decline(user.id, user.userId, user.pic))}>
                  <Text style = {styles.buttensText}>הסר משתמש</Text>
                </TouchableOpacity>
              </View>}
            </View>
        </View>
      </Modal>
    </View>
  );
}

//the search bar to search for users
const Search = (props) => {
  const list = props.list;

  const [searchList, setSearchList] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);

  //getting the list according to the input
  const searcher = (name)=>{
      setSearchList(list.filter(item=>(String(item.fname+item.lname).includes(name))));
  }

  useEffect(()=>{setSearchList(list)},[])


return (
  <View>
    <TouchableOpacity onPress={()=>setVisible(true)}>
          <Icons name='search' size={45}/>
    </TouchableOpacity>
      <Modal visible={visible}>
          <SafeAreaView style={styles.top}>
              <TouchableOpacity onPress={()=>{setVisible(false);setInput("");searcher("")}}>
                  <Icons name='arrow-back' style={{transform:[{rotateY: '180deg'}]}} size={45}/>
              </TouchableOpacity>
          {/*search bar*/}
          <View style={styles.searchBar}>    
              <TextInput 
                  style={styles.textInput}
                  placeholder='חפש'     
                  value={input}
                  onChangeText={text=>{setInput(text);searcher(text)}}
                  placeholderTextColor="#7f8c8d"
              />
              <TouchableOpacity onPress={()=>{setInput("");searcher("")}}>
                  <Text>X</Text>
              </TouchableOpacity>
          </View>
          </SafeAreaView>
          {/**the found list*/}
          <FlatList
           data={searchList}
           keyExtractor = {item=>item.id}
           renderItem={(data)=><UserItem  user={data.item} admin={false}/>}
          />
      </Modal>
  </View>
)
}



const Admin = () => {
  const [newUsers, setWaiter] = useState([]);
  const [allUsers, setUser] = useState([]);
  const [admins, setAdmins] = useState([]);
  //getting the new users
  useEffect (()=>{
    const ref = collection(db, 'users');
    const que = query (ref, where('guest','==', true));
    const unsubscribe = onSnapshot(que, querySnapshot => {
      setWaiter(
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          fname: doc.data().FirstName,
          lname: doc.data().LastName,
          questionaire: doc.data().questionaire,
          userId: doc.data().user_id,
          guest: doc.data().guest,
          admin: doc.data().isAdmin,
          email: doc.data().email,
          address: doc.data().Address,
          city: doc.data().city,
          phone: doc.data().phone,
          pic: doc.data().pic,
        })))  
    });

    const q = query (ref, where('guest','==', false),where('isAdmin','==',false));
    const unsubscribe2 = onSnapshot(q, querySnapshot => {
      setUser(
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          fname: doc.data().FirstName,
          lname: doc.data().LastName,
          questionaire: doc.data().questionaire,
          userId: doc.data().user_id,
          guest: doc.data().guest,
          admin: doc.data().isAdmin,
          email: doc.data().email,
          address: doc.data().Address,
          city: doc.data().city,
          phone: doc.data().phone,
          pic: doc.data().pic,
        })))  
    });

    const qe = query (ref,where('isAdmin','==',true));
    const unsubscribe3 = onSnapshot(qe, querySnapshot => {
      setAdmins(
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          fname: doc.data().FirstName,
          lname: doc.data().LastName,
          questionaire: doc.data().questionaire,
          userId: doc.data().user_id,
          guest: doc.data().guest,
          admin: doc.data().isAdmin,
          email: doc.data().email,
          address: doc.data().Address,
          city: doc.data().city,
          phone: doc.data().phone,
          pic: doc.data().pic,
        })))  
    });

    return () => {unsubscribe2();unsubscribe();unsubscribe3()};
 },[]);

  return (
    <View style={{flex:1}}>
      {newUsers.length!=0?
        <View style={styles.newTop}>
          <Text style={{fontWeight:'bold', fontSize:23, textAlign:'center'}}>משתמשים חדשים</Text>
          <FlatList data={newUsers}
          keyExtractor = {item=> item.id}
          renderItem = {(data)=><GuestItem userId={data.item.userId} id={data.item.id} name={data.item.fname+" "+data.item.lname} questionaire={data.item.questionaire} pic={data.item.pic}/>}
          />
        </View>:null}
        <View style={{width:'100%', borderWidth:1}}/>
        <View style={styles.newMid}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Search list={allUsers}/>
              <Text  style={{fontWeight:'bold', fontSize:23, marginStart:50}}>ניהול משתמשים</Text>
            </View>
            <FlatList
              data = {allUsers}
              keyExtractor = {item=> item.id}
              renderItem ={(data)=><UserItem user={data.item} admin={false}/>}
            />
        </View>
        <View style={{width:'100%', borderWidth:1}}/>
        <View style={styles.newBottom}>
          <Text style={{fontWeight:'bold', fontSize:23, textAlign:'center'}}>ניהול מנהלים</Text>
          <FlatList
              data = {admins}
              keyExtractor = {item=> item.id}
              renderItem ={(data)=><UserItem user={data.item} admin={true}/>}
            />
        </View>
     

    </View>

  )
}

export default Admin

const styles = StyleSheet.create({
  newUsers: {
    backgroundColor: "white",
    borderRadius: 5,
    margin: 5,
    padding: 5,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'space-between',
  },
  buttensStyle: {
    backgroundColor:"white",
    fontSize:14,
    borderWidth: 1,
    padding: 5,
    margin: 10,
    borderRadius: 10,
    width: 100,
    height: 40,
},
buttensText: {
  textAlign: 'center',
  fontWeight:"bold",
  paddingTop: 5
},
textStyle: {
  fontSize:20,
  fontWeight:"bold",
},
infoText:{
  textAlign:'left'
},
modal: {
  backgroundColor: "white",
  borderRadius: 25,
  marginTop: '50%',
  marginHorizontal: '2.5%',
  padding: 40,
  height: 310,
  width: '95%',
  flexDirection: "column",
  alignItems: "center",
  justifyContent:'flex-start',
  borderColor: "black",
  borderWidth: 1,
  shadowOffset: {
    width: 2,
    height: 2
  },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 5,
},
returnButten: {
  justifyContent: 'flex-start', 
},
textInput:{
  width:"95%",
  textAlign:"right",
  height:'100%',
  alignSelf:"flex-end",
  borderRadius:5,
  padding:5,
  fontSize:18,
  backgroundColor:"white"
},

searchBar:{
  flexDirection:'row',
  width:'85%',
  height: 40,
  borderColor:"gray",
  borderWidth:1,
  borderRadius:5,
  justifyContent: 'flex-start',
  alignItems:'center',
  alignSelf:'center',
  backgroundColor:"white"
},
top:{
    flexDirection:'row',
    width:'100%'
},
newTop:{
  flex:1
},
newMid:{
  flex:2,
},
newBottom:{
  flex:1
}


})