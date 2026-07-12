import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { firestoreDB } from '../../services/firebaseSetup';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, userData } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const services = [
    { title: 'Business', image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80', desc: 'Office spaces & retail' },
    { title: 'House', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', desc: 'Deep home cleaning' },
    { title: 'Floor Care', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', desc: 'Scrubbing & polishing' },
    { title: 'Deep Clean', image: 'https://images.unsplash.com/photo-1527515637-ed2e1850785c?auto=format&fit=crop&w=600&q=80', desc: 'Sanitization services' }
  ];

  useEffect(() => {
    const unsubscribe = firestoreDB.collection('Reviews').onSnapshot((querySnapshot) => {
      const revs: any[] = [];
      querySnapshot.forEach((doc) => {
        revs.push({ id: doc.id, ...doc.data() });
      });
      revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(revs.slice(0, 5) as never);
      setLoadingReviews(false);
    });

    return unsubscribe;
  }, []);

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View className="bg-teal-600 px-6 pt-16 pb-8 rounded-b-[40px] shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-teal-100 text-sm font-medium mb-1">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold tracking-tight">
              {userData ? userData.name : 'Guest'}
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-teal-500/50 rounded-full items-center justify-center border border-teal-400">
            <Ionicons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-white/10 p-5 rounded-3xl border border-white/20">
          <Text className="text-white text-lg font-bold mb-2">Need a sparkling clean?</Text>
          <Text className="text-teal-100 text-sm mb-4">Book a professional cleaning service today.</Text>
          <TouchableOpacity 
            className="bg-white rounded-2xl py-3 px-6 self-start shadow-sm flex-row items-center"
            onPress={() => router.push('/booking')}
          >
            <Text className="text-teal-700 font-bold mr-2">Book Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#0f766e" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Section */}
      <View className="px-6 mt-8">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-xl font-bold text-slate-800 tracking-tight">Our Services</Text>
          <TouchableOpacity>
            <Text className="text-teal-600 font-medium text-sm">See all</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {services.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              className="w-[48%] h-40 bg-white rounded-3xl mb-4 shadow-sm border border-slate-100 overflow-hidden"
              onPress={() => router.push('/booking')}
            >
              <ImageBackground 
                source={{ uri: item.image }} 
                className="flex-1 justify-end p-4"
                imageStyle={{ opacity: 0.85 }}
              >
                <View className="absolute inset-0 bg-black/40 rounded-3xl" />
                <Text className="text-white font-bold mb-1 shadow-sm relative">{item.title}</Text>
                <Text className="text-gray-200 text-xs relative">{item.desc}</Text>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reviews Section */}
      <View className="px-6 mt-4 mb-8">
        <Text className="text-xl font-bold text-slate-800 tracking-tight mb-4">Recent Reviews</Text>
        {loadingReviews ? (
          <ActivityIndicator size="large" color="#0d9488" className="mt-4" />
        ) : reviews.length === 0 ? (
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center">
            <Ionicons name="chatbubbles-outline" size={40} color="#cbd5e1" />
            <Text className="text-slate-400 mt-2 font-medium">No reviews yet.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            {reviews.map((rev: any) => (
              <View key={rev.id} className="bg-white w-72 rounded-3xl p-5 mr-4 shadow-sm border border-slate-100 mb-2">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-teal-700 font-bold text-lg">{rev.userName?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text className="font-bold text-slate-800">{rev.userName || 'Anonymous'}</Text>
                  </View>
                  <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-full">
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text className="text-amber-600 text-xs font-bold ml-1">{rev.rating}</Text>
                  </View>
                </View>
                <Text className="text-slate-600 text-sm leading-5">"{rev.comment}"</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}
