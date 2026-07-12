import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { firestoreDB } from '../../services/firebaseSetup';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ProfileField = ({ icon, label, value, editingValue, onChangeText, isEditMode }: any) => (
  <View className="flex-row items-center p-4 bg-white border-b border-slate-50 last:border-b-0">
    <View className="w-10 h-10 bg-teal-50 rounded-full items-center justify-center mr-4">
      <Ionicons name={icon} size={20} color="#0d9488" />
    </View>
    <View className="flex-1">
      <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</Text>
      {isEditMode ? (
        <TextInput
          className="text-base font-medium text-slate-800 mt-1 border-b border-teal-500 pb-1"
          value={editingValue}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text className="text-base font-medium text-slate-800 mt-0.5">{value || 'Not provided'}</Text>
      )}
    </View>
  </View>
);

export default function ProfileScreen() {
  const { user, userData, logout } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [city, setCity] = useState(userData?.city || '');
  const [saving, setSaving] = useState(false);

  // Update states if userData changes
  React.useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setCity(userData.city || '');
    }
  }, [userData]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await firestoreDB.collection('Users').doc(user.uid).update({
        name,
        phone,
        address,
        city
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      <View className="bg-teal-600 px-6 pt-16 pb-12 rounded-b-[40px] shadow-sm items-center relative">
        <TouchableOpacity 
          className="absolute top-16 right-6 w-10 h-10 bg-teal-500/50 rounded-full items-center justify-center border border-teal-400"
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {saving ? (
             <ActivityIndicator color="#ffffff" size="small" />
          ) : (
             <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
          <Text className="text-4xl font-bold text-teal-600">
            {name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-white tracking-tight">{name || 'Guest User'}</Text>
        <Text className="text-teal-100 mt-1">{user?.email}</Text>
      </View>

      <View className="px-6 -mt-6">
        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <ProfileField 
            icon="person-outline" 
            label="Full Name" 
            value={userData?.name} 
            editingValue={name}
            onChangeText={setName}
            isEditMode={isEditing}
          />
          <ProfileField 
            icon="call-outline" 
            label="Phone Number" 
            value={userData?.phone} 
            editingValue={phone}
            onChangeText={setPhone}
            isEditMode={isEditing}
          />
          <ProfileField 
            icon="home-outline" 
            label="Address" 
            value={userData?.address} 
            editingValue={address}
            onChangeText={setAddress}
            isEditMode={isEditing}
          />
          <ProfileField 
            icon="business-outline" 
            label="City" 
            value={userData?.city} 
            editingValue={city}
            onChangeText={setCity}
            isEditMode={isEditing}
          />
        </View>

        {!isEditing && (
          <TouchableOpacity 
            className="bg-white border border-red-100 rounded-3xl p-4 flex-row justify-center items-center mb-10 shadow-sm"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-red-600 font-bold text-lg ml-2">Log Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
