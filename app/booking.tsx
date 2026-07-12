import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { firestoreDB } from '../services/firebaseSetup';
import { AuthContext } from '../context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function BookingScreen() {
  const { user, userData } = useContext(AuthContext);
  const { editingId } = useLocalSearchParams();
  
  const [serviceType, setServiceType] = useState('House Cleaning');
  const [address, setAddress] = useState(userData?.address || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!!editingId);

  // Web fallback states
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);
  const [webTime, setWebTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  const services = ['House Cleaning', 'Office Cleaning', 'Deep Clean', 'Floor Care'];

  useEffect(() => {
    if (editingId) {
      firestoreDB.collection('Appointments').doc(editingId as string).get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data();
            setServiceType(data?.serviceType);
            setAddress(data?.address);
            if (data?.userPhone) setPhone(data.userPhone);
            
            if (data?.date) {
              setDate(new Date(data.date));
              setWebDate(data.date);
            }
            if (data?.time) {
              const [hours, minutes] = data.time.split(':');
              const d = new Date();
              d.setHours(parseInt(hours, 10));
              d.setMinutes(parseInt(minutes, 10));
              setTime(d);
              setWebTime(data.time);
            }
          }
          setFetchingData(false);
        });
    }
  }, [editingId]);

  const handleBooking = async () => {
    if (!address || !phone) {
      Alert.alert('Error', 'Please provide an address and phone number.');
      return;
    }
    
    setLoading(true);
    
    const finalDate = Platform.OS === 'web' ? webDate : date.toISOString().split('T')[0];
    const finalTime = Platform.OS === 'web' ? webTime : time.toTimeString().split(' ')[0].substring(0, 5);
    
    const appointmentData = {
      userId: user.uid,
      userName: userData?.name || user?.email,
      userPhone: phone,
      serviceType,
      address,
      city: userData?.city || '',
      date: finalDate,
      time: finalTime,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await firestoreDB.collection('Appointments').doc(editingId as string).update(appointmentData);
        Alert.alert('Success', 'Booking updated successfully!');
      } else {
        await firestoreDB.collection('Appointments').add(appointmentData);
        Alert.alert('Success', 'Booking created successfully!');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0d9488" />
        <Text className="text-slate-500 mt-4 font-medium">Loading booking details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6 pt-12" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100 mr-4">
          <Ionicons name="arrow-back" size={24} color="#0d9488" />
        </TouchableOpacity>
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          {editingId ? 'Edit Booking' : 'Book Service'}
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        
        {/* Service Type Selection */}
        <Text className="text-sm font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Service</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {services.map((srv) => (
            <TouchableOpacity 
              key={srv}
              onPress={() => setServiceType(srv)}
              className={`w-[48%] py-3 px-2 rounded-2xl mb-3 items-center border ${serviceType === srv ? 'bg-teal-600 border-teal-600' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-bold text-sm text-center ${serviceType === srv ? 'text-white' : 'text-slate-600'}`}>
                {srv}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Service Address</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
            <Ionicons name="location-outline" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-800"
              placeholder="Enter your address"
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Phone Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Contact Number</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
            <Ionicons name="call-outline" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-800"
              placeholder="Enter your phone number"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Date & Time Selection */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[48%]">
            <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Date</Text>
            {Platform.OS === 'web' ? (
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
                <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                <input 
                  type="date" 
                  value={webDate} 
                  onChange={(e) => setWebDate(e.target.value)} 
                  style={{ flex: 1, marginLeft: 8, border: 'none', background: 'transparent', fontSize: 16, outline: 'none', color: '#1e293b' }}
                />
              </View>
            ) : (
              <TouchableOpacity 
                className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                <Text className="ml-2 text-base text-slate-800 font-medium">{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="w-[48%]">
            <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Time</Text>
            {Platform.OS === 'web' ? (
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
                <Ionicons name="time-outline" size={20} color="#94a3b8" />
                <input 
                  type="time" 
                  value={webTime} 
                  onChange={(e) => setWebTime(e.target.value)} 
                  style={{ flex: 1, marginLeft: 8, border: 'none', background: 'transparent', fontSize: 16, outline: 'none', color: '#1e293b' }}
                />
              </View>
            ) : (
              <TouchableOpacity 
                className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200"
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#94a3b8" />
                <Text className="ml-2 text-base text-slate-800 font-medium">
                  {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Native Pickers (Mobile Only) */}
        {Platform.OS !== 'web' && showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
        {Platform.OS !== 'web' && showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        {/* Action Button */}
        <TouchableOpacity 
          className="bg-teal-600 rounded-2xl py-4 items-center shadow-sm"
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-bold">
              {editingId ? 'Update Booking' : 'Confirm Booking'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
