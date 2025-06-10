"use client"

import { useState } from "react"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useBirthdayStore } from "../../store/birthdayStore"
import { formatDate } from "../../utils/dateUtils"
import { Stack } from "expo-router"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

export default function AddScreen() {
  const { addBirthday, loading } = useBirthdayStore()

  const [name, setName] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [mobileNumber, setMobileNumber] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [branch, setBranch] = useState("")
  const [birthDate, setBirthDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleSubmit = async () => {
    // Validate inputs
    if (!name || !rollNumber || !mobileNumber || !fieldOfStudy || !branch) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number")
      return
    }

    try {
      await addBirthday({
        name,
        rollNumber,
        countryCode,
        mobileNumber,
        fieldOfStudy,
        branch,
        birthDate: birthDate.toISOString(),
      })

      // Reset form
      setName("")
      setRollNumber("")
      setMobileNumber("")
      setFieldOfStudy("")
      setBranch("")
      setBirthDate(new Date())

      Alert.alert("Success", "Birthday added successfully!")
    } catch (error) {
      Alert.alert("Error", "Failed to add birthday. Please try again.")
    }
  }

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setBirthDate(selectedDate)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ headerShown: true, title: "Add Birthday" }} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Birthday</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Roll Number</Text>
          <TextInput
            style={styles.input}
            value={rollNumber}
            onChangeText={setRollNumber}
            placeholder="Enter roll number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.countryCodeInput}
              value={countryCode}
              onChangeText={setCountryCode}
              placeholder="+91"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.phoneInput}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Field of Study</Text>
          <TextInput
            style={styles.input}
            value={fieldOfStudy}
            onChangeText={setFieldOfStudy}
            placeholder="Enter field of study"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Branch</Text>
          <TextInput style={styles.input} value={branch} onChangeText={setBranch} placeholder="Enter branch" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(birthDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && <DateTimePicker value={birthDate} mode="date" display="default" onChange={onDateChange} />}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Birthday</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4dabf7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 70,
    marginRight: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
})
