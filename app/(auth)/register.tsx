import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { auth, firestoreDB } from '../../services/firebaseSetup';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences' }: any) => (
  <View className="mb-4">
    <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
      <Ionicons name={icon} size={20} color="#94a3b8" />
      <TextInput
        className="flex-1 ml-3 text-base text-slate-800"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !address || !city || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        await firestoreDB.collection('Users').doc(user.uid).set({
          uid: user.uid,
          name,
          phone,
          address,
          city,
          email,
          role: email === 'spasan42@gmail.com' ? 'ADMIN' : 'USER',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6 pt-12" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')} 
        className="mb-6 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
      >
        <Ionicons name="arrow-back" size={24} color="#0d9488" />
      </TouchableOpacity>
      
      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">Create Account</Text>
        <Text className="text-base text-slate-500 mt-2 font-medium">Join us for premium cleaning services</Text>
      </View>

      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <InputField icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <InputField icon="call-outline" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <InputField icon="home-outline" placeholder="Address" value={address} onChangeText={setAddress} />
        <InputField icon="business-outline" placeholder="City" value={city} onChangeText={setCity} autoCapitalize="words" />
        <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity 
          className="bg-teal-600 rounded-2xl py-4 items-center mt-2 shadow-sm"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-bold">Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-2">
        <Text className="text-slate-500 font-medium">Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-teal-600 font-bold">Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}
 
