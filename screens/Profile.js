import React,{useState,useEffect} from 'react'
import {useWindowDimensions, View,Image, Text , StyleSheet,TouchableOpacity,TextInput,SafeAreaView,ScrollView} from 'react-native'
import { auth,db } from '../firebase';
import CustomButton from '../components/CustomButton';
import { MaterialIcons,Entypo } from '@expo/vector-icons';


const Profile = ({navigation}) => {
  const {height} = useWindowDimensions();
  const userId = auth.currentUser.uid; 
  const [userData,setUserData] = useState('');
  const [loading, setLoading] = useState(true);

  //get current user
  const getUser = async()=>{
    const currentUser = await db
    .collection('Users')
    .doc(userId)
    .get()
    .then((documentSnapshot)=>{
        if(documentSnapshot.exists){
            // console.log('user data',documentSnapshot.data());
            setUserData(documentSnapshot.data())
          
        }
    });
}    

useEffect(()=>{
  getUser();
  navigation.addListener('focus',()=>setLoading(!loading));
},[navigation,loading])



  const HandleSignout = ()=>{
    auth.signOut()
    .then(()=>{
    navigation.replace('Signin');
}).catch(error=>alert(error.message));
}

const handleEditProfile = () => {
  navigation.navigate('EditProfile')
}
const handleEditEmail = () => {
  navigation.navigate('EditEmail')
}
const handleEditPassword = () => {
  navigation.navigate('EditPassword')
}
  return (
    <SafeAreaView className="flex-1 mb-[60px] bg-[black]">
      <ScrollView className="pb-[100px]">
      <View className="w-full flex items-end">
        <TouchableOpacity onPress={HandleSignout} className="mt-12 mr-4">
        <MaterialIcons name="logout" size={30} color="#e8ca09" />
        </TouchableOpacity>
        </View>
        <View className="flex items-center mb-4">
          <Image source={{uri: userData ? userData.userImg || 'https://cdn2.iconfinder.com/data/icons/facebook-51/32/FACEBOOK_LINE-01-512.png' : 'https://cdn2.iconfinder.com/data/icons/facebook-51/32/FACEBOOK_LINE-01-512.png'}} resizeMode="contain" className="h-32 w-32 rounded-full" />
        </View>

        <View className="px-4">
            <View className="w-full flex-col justify-start">
              {/* <View className="w-full flex-row items-center justify-between"> */}
              <View className="w-full flex-row items-center justify-between">
                <Text className="text-[#606060]  text-lg font-bold">User name</Text>
                <Text className="text-[#606060] text-semibold" onPress={handleEditProfile}>Edit</Text>
              </View>
                {/* <Entypo name="edit" size={20} color="gray" onPress={handleEditProfile} /> */}
              <Text className="text-yellow-500 font-bold text-lg flex">{`${userData ? userData.name || 'No details added' : ''}`}</Text>
              {/* </View> */}
            </View>
            <View className="w-full flex-col justify-start mt-3">
              <View className="w-full flex-row items-center justify-between">
              <Text className="text-[#606060]  text-lg font-bold">Email</Text>
              <Text className="text-[#606060] text-semibold" onPress={handleEditEmail}>Edit</Text>
              {/* <Entypo name="edit" size={20} color="gray" onPress={handleEditEmail} /> */}
            
              </View>
              <Text className="font-bold text-lg .border-b flex text-yellow-500">{`${userData ? userData.email || 'No details added' : ''}`}</Text>
            </View>
            <View className="w-full flex-col justify-start mt-3">
            <View className="w-full flex-row items-center justify-between">
                <Text className="text-[#606060]  text-lg font-bold">Phone</Text>
                <Text className="text-[#606060] text-semibold" onPress={handleEditProfile}>Edit</Text>
              </View>
              <Text className="font-bold text-lg .border-b text-yellow-500 flex">{`${userData ? userData.number || 'No details added' : ''}`}</Text>
            </View>
            <View className="w-full flex-col justify-start mt-3">
            <View className="w-full flex-row items-center justify-between">
                <Text className="text-[#606060]  text-lg font-bold">Password</Text>
                <Text className="text-[#606060] text-semibold" onPress={handleEditPassword}>Edit</Text>
              </View>
              <Text className="font-bold text-lg .border-b text-yellow-500 flex">********</Text>
            </View>
            <View className="w-full flex-col justify-start mt-3">
            <View className="w-full flex-row items-center justify-between">
                <Text className="text-[#606060]  text-lg font-bold">Country</Text>
                <Text className="text-[#606060] text-semibold" onPress={handleEditProfile}>Edit</Text>
              </View>
              <Text className="font-bold text-lg .border-b flex text-yellow-500">{`${userData ? userData.country || 'No details added' : ''}`}</Text>
            </View>
            <View className="w-full flex-col justify-start mt-3">
            <View className="w-full flex-row items-center justify-between">
                <Text className="text-[#606060] text-lg font-bold">City</Text>
                <Text className="text-[#606060] text-semibold" onPress={handleEditProfile}>Edit</Text>
              </View>
              <Text className="font-bold text-lg .border-b flex text-yellow-500 pb-2">{`${userData ? userData.city || 'No details added' : ''}`}</Text>
            </View>
        </View>

       
                    
          {/* <View className="w-full flex px-8 mt-3 mb-20">
          <CustomButton text="Edit Profile" type="TERTIARY" onPress={handleEditProfile}/>
          </View> */}
       
      </ScrollView>

    </SafeAreaView>
  )
}

export default Profile