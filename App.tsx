import React, { useState } from "react";
import { View, Text, Image, Button, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import './global.css';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access the camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access the camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const sendImageToApi = async () => {
    if (!imageUri) {
        Alert.alert("Please select or take a photo first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/jpeg",
    } as any); // Casting to `any` to bypass TypeScript errors. 

    try {
        const response = await fetch("https://asia-south1-carbon-aquifer-439615-g0.cloudfunctions.net/predict", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error("Network response was not ok: " + errorData.message);
        }

        const data = await response.json();
        console.log("API Response:", data); // Log the response data
        setPrediction(data.class); // Set prediction from the 'class' field
        console.log("Prediction set to:", data.class); // Log the prediction
        setConfidence(data.confidence); // Set confidence correctly
        console.log("Confidence set to:", data.confidence); // Log the confidence
    } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Failed to upload image. Please try again.");
    }
};




  return (
    <View className="flex-1 bg-gray-900 items-center min-h-screen">
      <Text className="text-center text-green-400 font-bold text-4xl pt-8">
        Welcome to the App
      </Text>

      {/* Display the selected or taken image */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          className="h-64 w-64 rounded-lg mt-4"
        />
      )}

      {/* Buttons to select image or take a photo */}
      <View className="flex-row mt-6">
        <Button title="Select from Gallery" onPress={handleSelectImage} />
        <View style={{ width: 10 }} />
        <Button title="Take Photo" onPress={handleTakePhoto} />
      </View>

      {/* Button to send the image to the API */}
      <Button title="Send Image to API" onPress={sendImageToApi}/>

      {/* Display prediction and confidence */}
      {prediction && (
        <Text className="text-white mt-4">Prediction: {prediction}</Text>
      )}
      {confidence && (
        <Text className="text-white mt-2">Confidence: {confidence}%</Text>
      )}
    </View>
  );
}
