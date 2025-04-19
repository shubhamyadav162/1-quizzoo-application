import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Platform, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import { UserProfile, updateUserProfile } from '@/app/lib/LocalStorage';
import { useAuth } from '@/app/lib/AuthContext';
import { supabase } from '@/app/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  initialProfile: UserProfile | null;
  onSave: () => void;
}

const EditProfileModal = ({ visible, onClose, initialProfile, onSave }: EditProfileModalProps) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setEmail(initialProfile.email || '');
      setProfileImage(initialProfile.profileImage);
    } else if (user) {
      setName(user.user_metadata?.name || user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      const userImage = user.user_metadata?.profile_image || user.user_metadata?.picture;
      setProfileImage(userImage);
    }
  }, [initialProfile, user, visible]);

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to set a profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Resize and compress the image
        const manipulatedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        // Directly set the image URI (React Native does not support new Image())
        setProfileImage(manipulatedImage.uri);
        setImageError(false);
        console.log('Image selected and processed successfully:', manipulatedImage.uri.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleImageError = () => {
    if (profileImage) {
      setImageError(true);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      
      // If image has an error, don't save it
      const finalProfileImage = imageError ? undefined : profileImage;
      
      // Update only the fields that can be edited
      const updatedProfile = {
        name: name.trim(),
        email: email.trim() || undefined,
        profileImage: finalProfileImage
      };
      
      // Update local profile
      await updateUserProfile(updatedProfile);
      
      // If user is logged in with Supabase, also update metadata there
      if (user) {
        try {
          // Update the user metadata in Supabase
          const { data, error } = await supabase.auth.updateUser({
            data: {
              name: name.trim(),
              full_name: name.trim(),
              profile_image: finalProfileImage
            }
          });
          
          if (error) {
            console.error('Error updating user metadata in Supabase:', error);
            // Show error but don't block the local update
            Alert.alert('Warning', 'Profile updated locally but cloud sync failed. Some changes may not persist after logout.');
          } else {
            console.log('Successfully updated user metadata in Supabase:', data);
          }
        } catch (supabaseError) {
          console.error('Error updating Supabase user:', supabaseError);
          // Show error but don't block the local update
          Alert.alert('Warning', 'Profile updated locally but cloud sync failed. Some changes may not persist after logout.');
        }
      }
      
      Alert.alert('Success', 'Your profile has been updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <LinearGradient
                colors={isDark ? ['#1A237E', '#283593'] : ['#3949AB', '#5C6BC0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, {
                  paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16
                }]}
              >
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: '#fff' }]}>Edit Profile</ThemedText>
                <View style={styles.placeholder} />
              </LinearGradient>

              <View style={styles.imageContainer}>
                <TouchableOpacity 
                  style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#ddd' }]}
                  onPress={pickImage}
                >
                  {profileImage && !imageError ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.avatarImage} 
                      onError={handleImageError}
                      resizeMode="cover"
                    />
                  ) : (
                    <ThemedText style={styles.avatarText}>
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </ThemedText>
                  )}
                  <View style={styles.editImageButton}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <ThemedText style={styles.changePhotoText}>
                  Tap to change profile photo
                </ThemedText>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Name</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? '#333' : '#f5f5f5',
                        color: isDark ? '#fff' : '#000',
                        borderColor: isDark ? '#555' : '#ddd'
                      }
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={isDark ? '#aaa' : '#999'}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: isDark ? '#333' : '#f5f5f5',
                        color: isDark ? '#fff' : '#000',
                        borderColor: isDark ? '#555' : '#ddd'
                      }
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Your email"
                    placeholderTextColor={isDark ? '#aaa' : '#999'}
                    editable={!user?.email} // Email can't be edited if set by auth
                  />
                  {user?.email && (
                    <ThemedText style={styles.emailNote}>
                      Email cannot be changed for authenticated accounts
                    </ThemedText>
                  )}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    { opacity: isLoading ? 0.7 : 1 }
                  ]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#3949AB', '#5C6BC0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#5E5CE6',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5E5CE6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  emailNote: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#5E5CE6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  saveButtonGradient: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export default EditProfileModal; 