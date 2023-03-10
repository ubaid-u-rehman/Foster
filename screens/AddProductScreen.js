import { 
  useWindowDimensions,
  View,
  ImageBackground,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
 } from 'react-native'
import React,{useLayoutEffect,createRef,useEffect,useState,useCallback} from 'react'
import { useNavigation } from '@react-navigation/native'
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebase';
import storage from 'firebase/storage';
import firebase from 'firebase'
import { FontAwesome,MaterialIcons,AntDesign } from '@expo/vector-icons';
import DropDownPicker from "react-native-dropdown-picker";
import {Controller} from 'react-hook-form';

const AddProductScreen = ({route: {params}}) => {
  const userId = auth.currentUser.uid;
  const { height } = useWindowDimensions();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const navigation = useNavigation();
  const [userData, setUserData] = useState('');
  const [productType,setProductType] = useState(params?.productType || '')
  const [productTitle,setProductTitle] = useState(params?.productTitle || '')
  const [productDes,setProductDes] = useState(params?.productDes || '')
  const [productCondition,setProductCondition] = useState(params?.productCondition || '')
  const [productPrice,setProductPrice] = useState(params?.productPrice || '')
  const [loading,setLoading] = useState(false)


  useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: false
    })
}, [])

const bs = createRef();
const fall = new Animated.Value(1);

 //get current user data
 const getUser = async () => {
  const currentUser = await db
      .collection('Users')
      .doc(userId)
      .get()
      .then((documentSnapshot) => {
          if (documentSnapshot.exists) {
              // console.log('user data',documentSnapshot.data());
              setUserData(documentSnapshot.data())
          }
      });
}

useEffect(()=>{
  getUser()
},[])

const productRef = db.collection('AllProducts')

const handleAddProduct = async () => {
    
    if(productTitle && productType && productDes && productCondition && productPrice ){

        if(productType == 'Mobile' || productType == 'Laptop' || productType == 'Gadgets'){
            
        let imgUrl = await uploadImage();
        console.log(imgUrl);
    
    setLoading(true)
    if(imgUrl){
    await productRef.add({
      username: userData.name,
      phone: userData.number,
      userImage: userData.userImg ? userData.userImg : '',
      productImg: imgUrl,
      userid: userData.uid,
      productTitle: productTitle,
      productDes:productDes,
      productType: productType,
      productCondition:productCondition,
      productPrice:productPrice
    })
    .then(() => {
      setProductTitle('')
      setProductDes('')
      setProductCondition('')
      setProductType('')
      setLoading(false)
      Alert.alert('Product Created!', 'Your Product has been successfully Uploaded');
      setTimeout(()=>{
        navigation.navigate("Home")
      },2000)
    })
  }else{
    setLoading(false)
    alert("product image is required")
}
}else{
    Alert.alert('Error', 'Product Type Should be Mobile or Laptop or Gadgets');
}
}else{
    Alert.alert("All fields are required")
}

}


const handleUpdateProduct = async ()=>{
   
    if(productDes && productTitle && productType && productCondition && productPrice){
        if(productType == 'Mobile' || productType == 'Laptop' || productType == 'Gadgets'){
        let imgUrl = await uploadImage();
        console.log({ imgUrl });
        if (!imgUrl&& params.productImg) {
            imgUrl = params.productImg;
        }
    
    setLoading(true)
    await productRef.doc(params?.id).update({
      username: userData.name,
      phone: userData.number,
      userImage: userData.userImg ? userData.userImg : '',
      productImg: imgUrl,
      userid: userData.uid,
      productTitle: productTitle,
      productDes:productDes,
      productType: productType,
      productCondition:productCondition,
      productPrice:productPrice
    })
    .then(() => {
      setLoading(false)
      Alert.alert('Product Updated!', 'Your Product has been successfully Updated');
      setTimeout(()=>{
        navigation.goBack()
      },2000)
    })
}else{
    Alert.alert('Error', 'Product Type Should be Mobile or Laptop or Gadgets');
}
}else{
    Alert.alert("All fields are required")
}
}


const uploadImage = async () => {
  try {
      const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
              resolve(xhr.response);
          }
          xhr.onerror = function () {
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob';
          xhr.open('GET', image, true)
          xhr.send(null)
      })

      if (image == null) {
          return null;
      }

      const uploadUri = image;
      let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

      //add timestamp to file name
      const extension = filename.split('.').pop();
      const name = filename.split('.').slice(0, -1).join('.');
      filename = name + Date.now() + '.' + extension;

      setUploading(true);
      setTransferred(0);

      const storageRef = firebase.storage().ref(`productimages/`).child(filename)
      const task = storageRef.put(blob);

      //set transferred status
      task.on('state_changed', (taskSnapshot) => {
          // console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
          setTransferred(Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100)
      })

      try {
          await task;
          const url = await storageRef.getDownloadURL();
          console.log(url)
          setUploading(false);
          setImage(null);
          blob.close();
          return url;

      } catch (e) {
          console.log(e);
          blob.close()
          return null;
      }

  } catch (error) {
      console.log({error});
      return null;
  }
}

const choosePhotoFromLibrary = async () => {
  // Ask the user for the permission to access the media library 
  // const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  // if (permissionResult.granted === false) {
  //     alert("You've refused to allow this app to access your photos!");
  //     return;
  // }

  let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
  });
  if (!result.cancelled) {
      setImage(result.uri);
      console.log(result.uri)
  }
}


const renderHeader = () => (
  <View style={styles.header}>
      <View style={styles.panelHeader}>
          <View style={styles.panelHandle}></View>
      </View>
  </View>
)

 //render inner
 const renderInner = () => (
  <View style={styles.panel}>

      <View style={{ alignItems: 'center' }}>
          <Text style={styles.panelTitle}>Upload Photo</Text>
          <Text style={styles.panelSubtitle}>Choose your product picture</Text>
      </View>
      {/* <TouchableOpacity style={styles.panelButton} onPress={takePhoto}>
          <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.panelButton} className="bg-yellow-500" onPress={choosePhotoFromLibrary}>
          <Text style={styles.panelButtonTitle}>Choose from Library</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.panelButton} className="bg-yellow-500" onPress={() => bs.current.snapTo(1)}>
          <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
  </View>
)

if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'black' }}>
        <ActivityIndicator size="large" color="#e8ca09" />
      </View>
    );
  }


  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
  }}>
      
      <View className="flex-1 bg-[black]">
          <BottomSheet
              ref={bs}
              snapPoints={[330, 0]}
              renderContent={renderInner}
              renderHeader={renderHeader}
              initialSnap={1}
              callbackNode={fall}
              enabledGestureInteraction={true}
          />

            {/* <View className="relative">
            <TouchableOpacity className="absolute top-10 left-5 p-2 bg-gray-100 rounded-full"
                onPress={()=>navigation.goBack()}
                >
                <AntDesign name="arrowleft" size={24} color="#00CCBB" />
            </TouchableOpacity>
                </View>     */}

         

          <Animated.View  style={{ margin: 20, opacity: Animated.add(0.1, Animated.multiply(fall, 1.0)) }}>
          <View className="mt-6">
                        <TouchableOpacity className="p-2 rounded-full"
                            onPress={navigation.goBack}
                        >
                            <AntDesign name="arrowleft" size={34} color="#606060" />
                        </TouchableOpacity>
            </View>
              
              <View style={{ alignItems: 'center' }} className="pb-1">
                  <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
                      <View style={{
                          height: 100,
                          width: 100,
                          borderRadius: 75,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: 'gray'
                      }}>
                          <ImageBackground
                              source={{
                                  uri: image ?? image //: params ? params.productImg :'https://static.vecteezy.com/system/resources/previews/006/086/014/original/picture-gallery-interface-icon-vector.jpg'
                                }}
                                //   'data:image/png;base64,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',}}
                              style={styles.userImg}
                              imageStyle={{ borderRadius: 75 }}
                              className="contain"
                          >

                              <View style={{
                                  flex: 1,
                                  justifyContent: 'center',
                                  alignItems: 'center'
                              }}>
                                  <FontAwesome name="camera" size={35} color="white" style={{
                                      opacity: 0.7,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      // borderWidth:1,
                                      // borderColor:'#fff',
                                      // borderRadius:10
                                  }} />
                              </View>
                          </ImageBackground>
                      </View>
                  </TouchableOpacity>
              </View>


              <ScrollView
                contentContainerStyle={{
                    paddingBottom: 200
                }}
            >

                <View>
                    {/* <Text className="text-white text-lg">Product title</Text> */}
                </View>
             <View style={{marginTop:60}}>
             <View style={styles.action}>
                  {/* <MaterialIcons name="title" size={24} color="gray" /> */}
                  
                  <TextInput
                      placeholder='Product Title'
                      placeholderTextColor="gray"
                      style={styles.textInput}
                      autoCorrect={false}
                      value={productTitle}
                      onChangeText={(txt) => setProductTitle(txt)}
                  />
              </View>
             </View>

              {/* <View> */}
                    {/* <Text className="text-white text-lg">Product type <Text className="text-gray-600">(Laptop , Mobile or Gadgets)</Text></Text> */}
                {/* </View> */}
              <View style={{marginTop:15}}>
              <View style={styles.action}>
                  {/* <FontAwesome name="laptop" size={24} color="gray" /> */}
                  <TextInput
                      placeholder='Product type (Laptop, Mobile, Gadgets)'
                      placeholderTextColor="gray"
                      style={styles.textInput}
                      autoCorrect={false}
                      value={productType}
                      onChangeText={(txt) => setProductType(txt)}
                  />
              </View>
              </View>
  
              {/* <View> */}
                    {/* <Text className="text-white text-lg">Product condition</Text> */}
                {/* </View> */}
              <View style={{marginTop:15}}>
              <View style={styles.action}>
                  {/* <FontAwesome name="star-o" size={24} color="gray" /> */}
                  <TextInput
                      placeholder='Condition out of 10'
                      placeholderTextColor="gray"
                      style={styles.textInput}
                      autoCorrect={false}
                      keyboardType='numeric'
                      value={productCondition}
                      onChangeText={(txt) => setProductCondition(txt)}
                  />
              </View>
              </View>
              {/* <View> */}
                    {/* <Text className="text-white text-lg">Product price</Text> */}
                {/* </View> */}
              <View style={{marginTop:15}}>
              <View style={styles.action}>
                  {/* <FontAwesome name="money" size={24} color="gray" /> */}
                  <TextInput
                      placeholder='Price'
                      placeholderTextColor="gray"
                      style={styles.textInput}
                      autoCorrect={false}
                      keyboardType='numeric'
                      value={productPrice}
                      onChangeText={(txt) => setProductPrice(txt)}
                  />
              </View>
              </View>
              {/* <View> */}
                    {/* <Text className="text-white text-lg">Product description</Text> */}
                {/* </View> */}
             <View style={{marginTop:15}}>
             <View style={styles.action}>
                  {/* <MaterialIcons  name="description" size={24} color="gray" /> */}
                  <TextInput
                      placeholder='Product Description'
                      placeholderTextColor="gray"
                      style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                      autoCorrect={false}
                      multiline={true}
                      numberOfLines={4}
                      value={productDes}
                      onChangeText={(txt) => setProductDes(txt)}
                  />
              </View>
             </View>
             
           
              {params ? 
                <TouchableOpacity style={styles.commandButton} className="bg-yellow-500" onPress={handleUpdateProduct}>
                  <Text style={styles.panelButtonTitle} >Update Product</Text>
                </TouchableOpacity> : 
                <TouchableOpacity style={styles.commandButton} className="bg-yellow-500" onPress={handleAddProduct}>
                    <Text style={styles.panelButtonTitle} >Add Product</Text>
                </TouchableOpacity>
          }
              {/* <TouchableOpacity style={styles.commandButton} className="bg-[#4EB1B3]" onPress={()=>navigation.goBack()}>
                  <Text style={styles.panelButtonTitle} >Go Back</Text>
              </TouchableOpacity> */}
      </ScrollView>
          </Animated.View>
        
      </View>

     
  </TouchableWithoutFeedback>
  )
}


const styles = StyleSheet.create({
  container: {
      // flex:1,
  },
  commandButton: {
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
      paddingBottom:20
  },
  panel: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      paddingTop: 20,
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20,
      // shadowColor: '#000000',
      // shadowOffset: {width: 0, height: 0},
      // shadowRadius: 5,
      // shadowOpacity: 0.4,
  },
  header: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#333333',
      shadowOffset: { width: -1, height: -3 },
      shadowRadius: 2,
      shadowOpacity: 0.4,
      // elevation: 5,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
  },
  panelHeader: {
      alignItems: 'center',
  },
  panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
  },
  panelTitle: {
      fontSize: 27,
      height: 35,
  },
  panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10,
  },
  panelButton: {
      padding: 13,
      borderRadius: 15,
     
      alignItems: 'center',
      marginVertical: 7,
  },
  panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
  },
  action: {
      flexDirection: 'row',
      marginTop: 5,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'gray',
      padding: 8,
  },
  actionError: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#FF0000',
      paddingBottom: 5,
  },
  textInput: {
      flex: 1,
      marginTop: Platform.OS === 'ios' ? 0 : -12,
      paddingLeft: 10,
      color: 'gray',
      paddingBottom:4,
      paddingTop:4
  },
  userImg: {
      height: 110,
      width: 100,
      borderRadius: 75,
  },

  placeholderStyles: {
    color: "grey",
  },

})


export default AddProductScreen