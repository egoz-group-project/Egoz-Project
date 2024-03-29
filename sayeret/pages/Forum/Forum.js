import React, {useState, useEffect} from 'react';
import {Platform,Text, View, StyleSheet, FlatList,Modal,SafeAreaView, Alert, TextInput, TouchableOpacity} from 'react-native';
import { TouchableRipple,Avatar} from 'react-native-paper';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc} from 'firebase/firestore';
import { db,storage } from '../../firebase';
import { ref,getDownloadURL, deleteObject  } from 'firebase/storage';
import Profile from "../../assets/Images/profile.png"
import WriteToForum from './forumWrite';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import Icons from 'react-native-vector-icons/Ionicons'
import OpenForum from './OpenForum';


//formatting the date to the currect format
function dateFormat(timeStamp){
    let time = new Date(timeStamp.toMillis());
    let today = new Date();

    let tday =today.getDate();
    let tmonth = parseInt(today.getMonth()+1);
    let tyear =today.getFullYear();

    let day = time.getDate();
    let month = parseInt(time.getMonth()+1);
    let year  = time.getFullYear();


    let min = time.getMinutes();
    if(min<10){
        min = '0' + min;
    }
    let date;

    if(year-tyear==0 && month-tmonth==0 && tday-day<2){
        if(tday-day == 1)
            date = "אתמול"
        else if(tday-day == 0)
            date = time.getHours()+":"+min;
    }
    else
        date = day + "/"+ month+"/"+year;

    return date;
}

//deletes a chat from the app
const Delete =(id, pic)=>{
    Alert.alert(
        "למחוק?",
        "האם אתה בטוח שאתה רוצה למחוק את הפורום הזה",
        [
          {
            text: "בטל",
            onPress: () => {return},
          },
          {
            text: "מחק",
            onPress: async () => {
                deleteObject(ref(storage,"forum/"+pic));
                await deleteDoc(doc(db, "chats", id));
            },
        },
    ],
    );
   
}

const ForumItem = props=>{
    const user = props.user
    const [visible,setVisible] = useState(false);
    const [image,setImage] = useState();

    const download = ()=>{
        getDownloadURL( ref(storage, "forum/"+user.pic)).then((url)=> {
            setImage(url);
          })
          .catch ((e)=>{});
    }

    useEffect(()=>{download()},[])
    return(
        <View>
            {/* the item */}
            <TouchableRipple onLongPress={props.params.user.isAdmin?()=>Delete(user.id, user.pic):null} onPress={()=>{setVisible(true)}}>
                <View style={styles.container}>
                    <Avatar.Image style={{backgroundColor:'white'}} source={!image?Profile:{uri:image}}/>
                    <View style={styles.mid}>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.message} numberOfLines={1}>{user.last_message}</Text>
                    </View>
                    <Text style={styles.last}>{dateFormat(user.last_time)}</Text>
                </View>
            </TouchableRipple>
            
            {/* the chat room */}
            <Modal visible={visible} onRequestClose={()=>setVisible(false)}>
                <SafeAreaView style={styles.header}>   
                    <TouchableRipple onPress={()=>{setVisible(false)}}>
                        <Icon
                            name='arrow-right-thick'
                            size={30} 
                        />
                    </TouchableRipple>
                    <Avatar.Image 
                        source={!image?Profile:{uri:image}}
                        size={40}
                        style={{marginLeft:20,marginRight:10}}
                    />
                    <Text style={styles.name}>{user.name}</Text>
                </SafeAreaView>
                <WriteToForum id={user.id} params={props.params}/>
            </Modal>
        </View>    
    );
}

const Search = (props) => {
    const list = props.list;

    const [searchList, setSearchList] = useState([]);
    const [input, setInput] = useState("");
    const [visible, setVisible] = useState(false);

    //getting the list according to the input
    const searcher = (name)=>{
        setSearchList(list.filter(item=>(String(item.name).includes(name))));
    }

    useEffect(()=>{setSearchList(list)},[])


  return (
    <View>
        <View style = {{maxWidth:'13%'}}>
      <TouchableOpacity onPress={()=>setVisible(true)}>
            <Icons name='search' size={55}/>
      </TouchableOpacity>

        </View>
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
             renderItem={(data)=><ForumItem  user={data.item} params={props.params}/>}
            />
        </Modal>
    </View>
  )
}

const Forum = props=>{
    const [forumList, updateForumList] = useState([]);
    const [loaded, setLoad] = useState(false);

    useEffect(() => {
        const collectionRef = collection(db, 'chats');
        const q = query(collectionRef, orderBy('last_time', 'desc'));
    
        const unsubscribe = onSnapshot(q, querySnapshot => {
          updateForumList(
            querySnapshot.docs.map(doc => ({
              id:doc.id,
              name: doc.data().name,
              last_time: doc.data().last_time,
              last_message: doc.data().last_message,
              pic:doc.data().pic,
            }))
          );
          setLoad(true);
        });
        return () => unsubscribe();
      }, []);

    return(
        
        <View>
            
            {loaded?<Search list={forumList} params={props.route.params}/>:null}
            <FlatList data={forumList}
                style={{height:"81%"}}
                keyExtractor = {item=>item.id}
                renderItem={(data)=><ForumItem  user={data.item} params={props.route.params}/>}
                />
            <View style={{height:60, alignItems:'center',justifyContent:'center'}}>   
            {!props.route.params.user.guest?<OpenForum/>:null}
            </View>
        </View> 
        


        
    );
    
};

const styles = StyleSheet.create({
    name:{
        fontWeight:'bold',
        fontSize:20,
        alignSelf: "flex-start",
        marginTop:5,
    },
    message:{
        alignSelf: "flex-start",
    },
    last:{
        alignItems:'flex-start',
    },
    mid:{
        width:"50%",
        marginLeft:20,
    },
    container:{
        flexDirection:'row',
        alignItems:'center',
        marginVertical:8,
        marginHorizontal:20
    },
    header:{
        flexDirection:"row",
        alignItems:"center",
        paddingVertical:15,
        backgroundColor:"#485260", 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        paddingTop: Platform.OS === 'ios'? 30:15,
        paddingLeft:5,
        paddingBottom: Platform.OS === 'ios'? "13%":10
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



    

})

export default Forum
