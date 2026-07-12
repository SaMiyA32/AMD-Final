import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Pressable, StyleSheet } from 'react-native';
import { firestoreDB } from '../../services/firebaseSetup';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AppointmentsScreen() {
  const { user, userData } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<any>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  // Cancel Modal states
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingApp, setCancellingApp] = useState<any>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestoreDB.collection('Appointments')
      .where('userId', '==', user.uid)
      .onSnapshot((querySnapshot) => {
        const apps: any[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAppointments(apps as never[]);
        setLoading(false);
      });
    return unsubscribe;
  }, [user]);

  const sendEmailNotification = async (appointmentData: any, status: string, reason: string = '') => {
    try {
      await fetch('http://172.20.10.8:3000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: user.email, // Since we need the user's email, we use user.email
          userName: userData?.name || user.email,
          serviceType: appointmentData.serviceType,
          date: appointmentData.date,
          time: appointmentData.time,
          status: status,
          reason: reason
        })
      });
    } catch (error) {
      console.log('Email server error:', error);
      // We don't block the UI if email fails (server might not be running)
    }
  };

  const handleEdit = (appointment: any) => {
    router.push({ pathname: '/booking', params: { editingId: appointment.id } });
  };

  const initiateCancel = (appointment: any) => {
    setCancellingApp(appointment);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation.');
      return;
    }
    
    setIsSubmittingCancel(true);
    try {
      await firestoreDB.collection('Appointments').doc(cancellingApp.id).update({
        status: 'Cancelled',
        cancelReason: cancelReason
      });
      
      // Call email backend
      await sendEmailNotification(cancellingApp, 'Cancelled', cancelReason);
      
      Alert.alert('Success', 'Appointment cancelled successfully.');
      setCancelModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const openReviewModal = async (appointment: any) => {
    setSelectedAppForReview(appointment);
    setRating('5');
    setComment('');
    setEditingReviewId(null);
    setReviewModalVisible(true);

    if (appointment.reviewed) {
      try {
        const querySnapshot = await firestoreDB.collection('Reviews')
          .where('appointmentId', '==', appointment.id)
          .get();
        if (!querySnapshot.empty) {
          const reviewDoc = querySnapshot.docs[0];
          setEditingReviewId(reviewDoc.id);
          const reviewData = reviewDoc.data();
          setRating(reviewData.rating.toString());
          setComment(reviewData.comment);
        }
      } catch (error) {
        console.error('Error fetching review:', error);
      }
    }
  };

  const submitReview = async () => {
    if (!rating || !comment) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await firestoreDB.collection('Reviews').doc(editingReviewId).update({
          rating: parseInt(rating),
          comment
        });
        Alert.alert('Success', 'Review updated!');
      } else {
        await firestoreDB.collection('Reviews').add({
          appointmentId: selectedAppForReview.id,
          userId: user.uid,
          userName: selectedAppForReview.userName || 'Anonymous',
          serviceType: selectedAppForReview.serviceType,
          rating: parseInt(rating),
          comment,
          createdAt: new Date().toISOString()
        });
        await firestoreDB.collection('Appointments').doc(selectedAppForReview.id).update({ reviewed: true });
        Alert.alert('Success', 'Thank you for your review!');
      }
      setReviewModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async () => {
    if (!editingReviewId) return;
    
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeletingReview(true);
        try {
          await firestoreDB.collection('Reviews').doc(editingReviewId).delete();
          await firestoreDB.collection('Appointments').doc(selectedAppForReview.id).update({ reviewed: false });
          Alert.alert('Success', 'Review deleted.');
          setReviewModalVisible(false);
        } catch (error) {
          Alert.alert('Error', 'Failed to delete review');
        } finally {
          setDeletingReview(false);
        }
      }}
    ]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return 'time-outline';
      case 'Accepted': return 'checkmark-circle-outline';
      case 'Rejected':
      case 'Cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-teal-50 rounded-full items-center justify-center mr-3">
            <Ionicons name="calendar-outline" size={24} color="#0d9488" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-800">{item.serviceType}</Text>
            <Text className="text-slate-500 text-sm">{item.date} at {item.time}</Text>
          </View>
        </View>
        <View className={`px-3 py-1.5 rounded-full border flex-row items-center ${getStatusColor(item.status)}`}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color="currentColor" />
          <Text className="font-bold text-xs ml-1 capitalize">{item.status}</Text>
        </View>
      </View>

      <View className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#94a3b8" />
          <Text className="text-slate-600 ml-2 font-medium">{item.address}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="call-outline" size={16} color="#94a3b8" />
          <Text className="text-slate-600 ml-2 font-medium">{item.userPhone || 'No phone provided'}</Text>
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
        <View className="flex-row justify-end space-x-3">
          <TouchableOpacity 
            className="flex-row items-center bg-teal-50 px-4 py-2.5 rounded-xl mr-3"
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#0d9488" />
            <Text className="text-teal-700 font-bold ml-1.5">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center bg-red-50 px-4 py-2.5 rounded-xl"
            onPress={() => initiateCancel(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text className="text-red-600 font-bold ml-1.5">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Accepted' && (
        <TouchableOpacity 
          className={`${item.reviewed ? 'bg-slate-100 border-slate-200' : 'bg-amber-100 border-amber-200'} py-3 rounded-xl items-center flex-row justify-center mt-2 border`}
          onPress={() => openReviewModal(item)}
        >
          <Ionicons name="star" size={18} color={item.reviewed ? "#64748b" : "#d97706"} />
          <Text className={`${item.reviewed ? 'text-slate-600' : 'text-amber-700'} font-bold ml-2`}>
            {item.reviewed ? 'Manage Review' : 'Leave a Review'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-teal-600 px-6 pt-16 pb-6 rounded-b-[40px] shadow-sm mb-4">
        <Text className="text-3xl font-black text-white tracking-tight">My Bookings</Text>
        <Text className="text-teal-100 mt-1">Manage your cleaning appointments</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" className="mt-10" />
      ) : appointments.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-24 h-24 bg-teal-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="calendar-clear-outline" size={48} color="#0d9488" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-2">No Appointments</Text>
          <Text className="text-slate-500 text-center mb-6">You haven't booked any cleaning services yet.</Text>
          <TouchableOpacity 
            className="bg-teal-600 px-6 py-3 rounded-full flex-row items-center shadow-sm"
            onPress={() => router.push('/booking')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text className="text-white font-bold ml-1">Book Now</Text>
          </TouchableOpacity>
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

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="w-full max-w-sm">
            <View className="bg-white p-6 rounded-3xl shadow-lg w-full">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="alert" size={20} color="#ef4444" />
                </View>
                <Text className="text-xl font-bold text-slate-800 flex-1">Cancel Booking</Text>
              </View>
              
              <Text className="text-slate-500 mb-4">Are you sure you want to cancel? Please tell us why.</Text>

              <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-red-500 h-24 mb-6">
                <TextInput
                  className="flex-1 text-base text-slate-800 text-top"
                  placeholder="Reason for cancellation..."
                  placeholderTextColor="#94a3b8"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity 
                  className="px-6 py-3 rounded-xl bg-slate-100 mr-2"
                  onPress={() => setCancelModalVisible(false)}
                  disabled={isSubmittingCancel}
                >
                  <Text className="text-slate-600 font-bold">Nevermind</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-6 py-3 rounded-xl bg-red-500 min-w-[100px] items-center"
                  onPress={confirmCancel}
                  disabled={isSubmittingCancel}
                >
                  {isSubmittingCancel ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold">Confirm Cancel</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="bg-white p-6 rounded-t-3xl shadow-lg border-t border-slate-100">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-800">{editingReviewId ? 'Edit Review' : 'Write a Review'}</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View className="mb-4">
                <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1">Rating (1-5)</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500">
                  <Ionicons name="star-outline" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-800"
                    placeholder="5"
                    placeholderTextColor="#94a3b8"
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-slate-500 mb-2 ml-1">Comment</Text>
                <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-teal-500 h-28">
                  <TextInput
                    className="flex-1 text-base text-slate-800 text-top"
                    placeholder="How was the cleaning service?"
                    placeholderTextColor="#94a3b8"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View className="flex-row justify-between space-x-3">
                {editingReviewId && (
                  <TouchableOpacity 
                    className="flex-1 bg-red-50 rounded-2xl py-4 items-center border border-red-200 mr-2"
                    onPress={deleteReview}
                    disabled={deletingReview || submittingReview}
                  >
                    {deletingReview ? (
                      <ActivityIndicator color="#ef4444" />
                    ) : (
                      <Text className="text-red-600 text-lg font-bold">Delete</Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  className={`flex-[2] bg-teal-600 rounded-2xl py-4 items-center shadow-sm ${editingReviewId ? 'ml-2' : ''}`}
                  onPress={submitReview}
                  disabled={submittingReview || deletingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white text-lg font-bold">{editingReviewId ? 'Update Review' : 'Submit Review'}</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View className="h-4" />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
