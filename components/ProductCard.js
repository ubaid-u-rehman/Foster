import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React,{useState} from 'react'
import { AntDesign,Entypo } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native'

const ProductCard = ({data}) => {

const navigation = useNavigation();

  return (
    <View>
        <ScrollView
      horizontal
      contentContainerStyle={{
        paddingHorizontal: 15
      }}
      showsHorizontalScrollIndicator={false}
      className="pt-4"
    >

    {data?.map((item)=>(
    <TouchableOpacity
    key={item.id}
    className="bg-[#18191a] mr-3 shadow-lg border border-gray-800"
    onPress={() => navigation.navigate('ProductDetail',item)}
    >
        <View className="w-full flex items-center pt-2">

        <Image 
            source={{
                uri: item.productImg
            }}
            className="w-40 h-40 rounded-sm object-contain"
            />
        </View>

        <View className="px-3 pb-4">
            <Text className="font-bold text-yellow-500 text-lg pt-2">{item.productTitle}</Text>
            <View className="flex-row items-center space-x-1">
                <AntDesign name="star" size={18} color="#FF9529" />
                <Text className="text-white"> 
                   <Text className="text-yellow-500">{item.productCondition}</Text> ~ {item.productType}
                </Text>
            </View>

            <View className="flex-row items-center space-x-1 mt-1">
                <Text numberOfLines={2} className="text-xs text-gray-300 w-[260px]">{item.productDes}</Text>
            </View>
        </View>
    </TouchableOpacity>
))}
    </ScrollView>
    </View>
  )
}

export default ProductCard