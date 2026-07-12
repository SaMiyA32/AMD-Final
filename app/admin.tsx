import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Pressable, StyleSheet } from 'react-native';
import { firestoreDB } from '../services/firebaseSetup';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingApp, setRejectingApp] = useState<any>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Accept Modal states
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [acceptingApp, setAcceptingApp] = useState<any>(null);
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);

  useEffect(() => {
    const unsubscribe = firestoreDB.collection('Appointments')
      .onSnapshot((querySnapshot) => {
        const apps: any[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        // Sort by date (newest first)
        apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAppointments(apps as never[]);
        setLoading(false);
      });
    return unsubscribe;
  }, []);

  const sendEmailNotification = async (appointmentData: any, status: string, reason: string = '') => {
    try {
      // Find the user email (we stored userId, but we need the actual user email.
      // We can fetch from Users collection using userId)
      const userDoc = await firestoreDB.collection('Users').doc(appointmentData.userId).get();
      const userEmail = userDoc.data()?.email;
      const userName = userDoc.data()?.name || userEmail;

      if (!userEmail) return;

      await fetch('http://172.20.10.8:3000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: userEmail,
          userName: userName,
          serviceType: appointmentData.serviceType,
          date: appointmentData.date,
          time: appointmentData.time,
          status: status,
          reason: reason
        })
      });
    } catch (error) {
      console.log('Email server error:', error);
    }
  };

  const initiateAccept = (appointment: any) => {
    setAcceptingApp(appointment);
    setAcceptModalVisible(true);
  };

  const confirmAccept = async () => {
    setIsSubmittingAccept(true);
    try {
      await firestoreDB.collection('Appointments').doc(acceptingApp.id).update({ status: 'Accepted' });
      await sendEmailNotification(acceptingApp, 'Accepted');
      setAcceptModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsSubmittingAccept(false);
    }
  };

  const initiateReject = (appointment: any) => {
    setRejectingApp(appointment);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmittingReject(true);
    try {
      await firestoreDB.collection('Appointments').doc(rejectingApp.id).update({
        status: 'Rejected',
        cancelReason: rejectReason
      });
      
      await sendEmailNotification(rejectingApp, 'Rejected', rejectReason);
      
      Alert.alert('Success', 'Appointment rejected successfully.');
      setRejectModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to reject appointment.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Accepted': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Rejected': 
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-800">{item.serviceType}</Text>
          <Text className="text-slate-500 font-medium">{item.date} at {item.time}</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full border ${getStatusColor(item.status)}`}>
          <Text className="font-bold text-xs uppercase tracking-wider">{item.status}</Text>
        </View>
      </View>

      <View className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
        <View className="flex-row items-center mb-2">
          <Ionicons name="person-outline" size={16} color="#94a3b8" />
          <Text className="text-slate-700 font-bold ml-2">Client ID: <Text className="font-normal">{item.userId.substring(0,8)}...</Text></Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="call-outline" size={16} color="#94a3b8" />
          <Text className="text-slate-700 font-bold ml-2">Phone: <Text className="font-normal text-teal-600">{item.userPhone || 'Not provided'}</Text></Text>
        </View>
        <View className="flex-row items-start">
          <Ionicons name="location-outline" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
          <Text className="text-slate-700 font-bold ml-2 flex-1">
            Address: <Text className="font-normal">{item.address} {item.city ? `(${item.city})` : ''}</Text>
          </Text>
        </View>
      </View>

      {(item.status === 'Cancelled' || item.status === 'Rejected') && item.cancelReason && (
        <View className="bg-red-50 p-4 rounded-2xl mb-4 border border-red-100">
          <View className="flex-row items-center mb-1">
            <Ionicons name="information-circle-outline" size={16} color="#ef4444" />
            <Text className="text-red-700 font-bold ml-1 text-sm">Reason for {item.status}:</Text>
          </View>
          <Text className="text-red-600 text-sm ml-5">{item.cancelReason}</Text>
        </View>
      )}

      {item.status === 'Pending' && (
        <View className="flex-row space-x-3 mt-2">
          <TouchableOpacity 
            className="flex-1 bg-red-50 py-3 rounded-xl border border-red-200 items-center mr-2"
            onPress={() => initiateReject(item)}
          >
            <Text className="text-red-600 font-bold">Reject</Text>
          </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-[2] bg-teal-600 py-3 rounded-xl items-center shadow-sm ml-2"
                    onPress={() => initiateAccept(item)}
                  >
                    <Text className="text-white font-bold">Accept Order</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );

          return (
            <View className="flex-1 bg-slate-50">
              <View className="bg-slate-800 px-6 pt-16 pb-6 rounded-b-[40px] shadow-sm mb-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-3xl font-black text-white tracking-tight">Dashboard</Text>
                  <Text className="text-slate-400 mt-1">Admin Panel</Text>
                </View>
                <TouchableOpacity 
                  onPress={async () => {
                    await logout();
                    router.replace('/(auth)/login');
                  }}
                  className="w-12 h-12 bg-slate-700 rounded-full items-center justify-center border border-slate-600"
                >
                  <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
              ) : appointments.length === 0 ? (
                <View className="flex-1 justify-center items-center p-6">
                  <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                  <Text className="text-xl font-bold text-slate-800 mt-4">No Orders</Text>
                  <Text className="text-slate-500 text-center mt-2">There are no cleaning appointments yet.</Text>
                </View>
              ) : (
                <FlatList
                  data={appointments}
                  renderItem={renderItem}
                  keyExtractor={(item: any) => item.id}
                  contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {/* Accept Modal */}
              <Modal visible={acceptModalVisible} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50 p-6">
                  <Pressable style={StyleSheet.absoluteFill} onPress={() => setAcceptModalVisible(false)} />
                  <View className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-sm z-10">
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                        <Ionicons name="call" size={20} color="#0d9488" />
                      </View>
                      <Text className="text-xl font-bold text-slate-800 flex-1">Confirm Acceptance</Text>
                    </View>
                    
                    <Text className="text-slate-500 mb-6 text-base">Did you call the user to inform them about this appointment? We will send an email confirmation to the user.</Text>

                    <View className="flex-row justify-end space-x-3">
                      <TouchableOpacity 
                        className="px-6 py-3 rounded-xl bg-slate-100 mr-2"
                        onPress={() => setAcceptModalVisible(false)}
                        disabled={isSubmittingAccept}
                      >
                        <Text className="text-slate-600 font-bold">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="px-6 py-3 rounded-xl bg-teal-600 min-w-[120px] items-center shadow-sm"
                        onPress={confirmAccept}
                        disabled={isSubmittingAccept}
                      >
                        {isSubmittingAccept ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text className="text-white font-bold">Yes, I Called</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Reject Modal */}
              <Modal visible={rejectModalVisible} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50 p-6">
                  <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
                  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="w-full max-w-sm">
                    <View className="bg-white p-6 rounded-3xl shadow-lg w-full">
                      <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                          <Ionicons name="alert" size={20} color="#ef4444" />
                        </View>
                        <Text className="text-xl font-bold text-slate-800 flex-1">Reject Booking</Text>
                      </View>
                      
                      <Text className="text-slate-500 mb-4">Please provide a reason for rejecting this order. The user will see this.</Text>

                      <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-red-500 h-24 mb-6">
                        <TextInput
                          className="flex-1 text-base text-slate-800 text-top"
                          placeholder="Reason for rejection..."
                          placeholderTextColor="#94a3b8"
                          value={rejectReason}
                          onChangeText={setRejectReason}
                          multiline
                          textAlignVertical="top"
                        />
                      </View>

                      <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity 
                          className="px-6 py-3 rounded-xl bg-slate-100 mr-2"
                          onPress={() => setRejectModalVisible(false)}
                          disabled={isSubmittingReject}
                        >
                          <Text className="text-slate-600 font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          className="px-6 py-3 rounded-xl bg-red-500 min-w-[100px] items-center"
                          onPress={confirmReject}
                          disabled={isSubmittingReject}
                        >
                          {isSubmittingReject ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text className="text-white font-bold">Reject Order</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </Modal>
            </View>
          );
        }
