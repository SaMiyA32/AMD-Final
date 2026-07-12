import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../../services/firebaseSetup';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Navigation is handled by layout observer
    } catch (error: any) {
      Alert.alert('Login Failed', 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 justify-center p-6">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-teal-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="sparkles" size={48} color="#0d9488" />
        </View>
        <Text className="text-4xl font-black text-slate-800 tracking-tight">Crystal Clear</Text>
        <Text className="text-base text-slate-500 mt-2 font-medium">Premium Cleaning Services</Text>
      </View>

      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1">Email Address</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
            <Ionicons name="mail-outline" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-800"
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1">Password</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-base text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-teal-600 rounded-2xl py-4 items-center shadow-sm"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-bold">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-4">
        <Text className="text-slate-500 font-medium">Don't have an account? </Text>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text className="text-teal-600 font-bold">Create Account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default LoginScreen;
