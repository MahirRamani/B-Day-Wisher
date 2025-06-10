"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
import { useNotificationStore } from "../../store/notificationStore"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Stack } from "expo-router"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

export default function SettingsScreen() {
  const { settings, updateSettings, rescheduleAllNotifications } = useNotificationStore()

  const [localSettings, setLocalSettings] = useState(settings)
  const [showDayBeforeTimePicker, setShowDayBeforeTimePicker] = useState(false)
  const [showDayOfTimePicker, setShowDayOfTimePicker] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleToggleChange = (key: keyof typeof localSettings) => {
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key],
    })
  }

  const handleDayBeforeTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowDayBeforeTimePicker(false)
    if (selectedTime) {
      setLocalSettings({
        ...localSettings,
        dayBeforeTime: selectedTime,
      })
    }
  }

  const handleDayOfTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowDayOfTimePicker(false)
    if (selectedTime) {
      setLocalSettings({
        ...localSettings,
        dayOfTime: selectedTime,
      })
    }
  }

  const handleMessageChange = (text: string) => {
    setLocalSettings({
      ...localSettings,
      defaultMessage: text,
    })
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings)
      Alert.alert("Settings Saved", "Would you like to reschedule all notifications with these new settings?", [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            await rescheduleAllNotifications()
            Alert.alert("Success", "All notifications have been rescheduled.")
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.")
    }
  }

  const formatTimeString = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ headerShown: true, title: "Settings" }} />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>Turn on/off all birthday notifications</Text>
          </View>
          <Switch
            value={localSettings.enableNotifications}
            onValueChange={() => handleToggleChange("enableNotifications")}
            trackColor={{ false: "#767577", true: "#4dabf7" }}
            thumbColor={localSettings.enableNotifications ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
          <View>
            <Text style={styles.settingLabel}>Day Before Reminder</Text>
            <Text style={styles.settingDescription}>Send notification one day before birthday</Text>
          </View>
          <Switch
            value={localSettings.enableDayBeforeNotification}
            onValueChange={() => handleToggleChange("enableDayBeforeNotification")}
            trackColor={{ false: "#767577", true: "#4dabf7" }}
            thumbColor={localSettings.enableDayBeforeNotification ? "#fff" : "#f4f3f4"}
            disabled={!localSettings.enableNotifications}
          />
        </View>

        {localSettings.enableNotifications && localSettings.enableDayBeforeNotification && (
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>Notification Time:</Text>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowDayBeforeTimePicker(true)}>
              <Text style={styles.timePickerButtonText}>{formatTimeString(localSettings.dayBeforeTime)}</Text>
            </TouchableOpacity>

            {showDayBeforeTimePicker && (
              <DateTimePicker
                value={localSettings.dayBeforeTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleDayBeforeTimeChange}
              />
            )}
          </View>
        )}

        <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
          <View>
            <Text style={styles.settingLabel}>Birthday Day Notification</Text>
            <Text style={styles.settingDescription}>Send notification on the birthday</Text>
          </View>
          <Switch
            value={localSettings.enableDayOfNotification}
            onValueChange={() => handleToggleChange("enableDayOfNotification")}
            trackColor={{ false: "#767577", true: "#4dabf7" }}
            thumbColor={localSettings.enableDayOfNotification ? "#fff" : "#f4f3f4"}
            disabled={!localSettings.enableNotifications}
          />
        </View>

        {localSettings.enableNotifications && localSettings.enableDayOfNotification && (
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>Notification Time:</Text>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowDayOfTimePicker(true)}>
              <Text style={styles.timePickerButtonText}>{formatTimeString(localSettings.dayOfTime)}</Text>
            </TouchableOpacity>

            {showDayOfTimePicker && (
              <DateTimePicker
                value={localSettings.dayOfTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleDayOfTimeChange}
              />
            )}
          </View>
        )}

        <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
          <View>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={styles.settingDescription}>Play sound with notifications</Text>
          </View>
          <Switch
            value={localSettings.enableSound}
            onValueChange={() => handleToggleChange("enableSound")}
            trackColor={{ false: "#767577", true: "#4dabf7" }}
            thumbColor={localSettings.enableSound ? "#fff" : "#f4f3f4"}
            disabled={!localSettings.enableNotifications}
          />
        </View>

        <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
          <View>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>Vibrate with notifications</Text>
          </View>
          <Switch
            value={localSettings.enableVibration}
            onValueChange={() => handleToggleChange("enableVibration")}
            trackColor={{ false: "#767577", true: "#4dabf7" }}
            thumbColor={localSettings.enableVibration ? "#fff" : "#f4f3f4"}
            disabled={!localSettings.enableNotifications}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Message Template</Text>
        <Text style={styles.settingDescription}>Customize your default birthday message</Text>

        <TextInput
          style={styles.messageInput}
          value={localSettings.defaultMessage}
          onChangeText={handleMessageChange}
          placeholder="Enter your default birthday message"
          multiline
          numberOfLines={3}
          editable={localSettings.enableNotifications}
        />

        <Text style={styles.templateHint}>Use {"{name}"} to include the person's name in your message.</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.rescheduleButton} onPress={rescheduleAllNotifications}>
        <Text style={styles.rescheduleButtonText}>Reschedule All Notifications</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  disabledSetting: {
    opacity: 0.5,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  timePickerLabel: {
    fontSize: 14,
    color: "#495057",
    marginRight: 8,
  },
  timePickerButton: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  timePickerButtonText: {
    fontSize: 14,
    color: "#495057",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  templateHint: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 8,
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#4dabf7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  rescheduleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4dabf7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  rescheduleButtonText: {
    color: "#4dabf7",
    fontSize: 16,
    fontWeight: "bold",
  },
})




// "use client"

// import { useState, useEffect } from "react"
// import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
// import { useNotificationStore } from "../../store/notificationStore"
// import DateTimePicker from "@react-native-community/datetimepicker"
// import { Stack } from "expo-router"

// export default function SettingsScreen() {
//   const { settings, updateSettings, rescheduleAllNotifications } = useNotificationStore()

//   const [localSettings, setLocalSettings] = useState(settings)
//   const [showDayBeforeTimePicker, setShowDayBeforeTimePicker] = useState(false)
//   const [showDayOfTimePicker, setShowDayOfTimePicker] = useState(false)

//   useEffect(() => {
//     setLocalSettings(settings)
//   }, [settings])

//   const handleToggleChange = (key) => {
//     setLocalSettings({
//       ...localSettings,
//       [key]: !localSettings[key],
//     })
//   }

//   const handleDayBeforeTimeChange = (event, selectedTime) => {
//     setShowDayBeforeTimePicker(false)
//     if (selectedTime) {
//       setLocalSettings({
//         ...localSettings,
//         dayBeforeTime: selectedTime,
//       })
//     }
//   }

//   const handleDayOfTimeChange = (event, selectedTime) => {
//     setShowDayOfTimePicker(false)
//     if (selectedTime) {
//       setLocalSettings({
//         ...localSettings,
//         dayOfTime: selectedTime,
//       })
//     }
//   }

//   const handleMessageChange = (text) => {
//     setLocalSettings({
//       ...localSettings,
//       defaultMessage: text,
//     })
//   }

//   const handleSaveSettings = async () => {
//     try {
//       await updateSettings(localSettings)
//       Alert.alert("Settings Saved", "Would you like to reschedule all notifications with these new settings?", [
//         {
//           text: "No",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             await rescheduleAllNotifications()
//             Alert.alert("Success", "All notifications have been rescheduled.")
//           },
//         },
//       ])
//     } catch (error) {
//       Alert.alert("Error", "Failed to save settings. Please try again.")
//     }
//   }

//   const formatTimeString = (date) => {
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//   }

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//       <Stack.Screen options={{ headerShown: true, title: "Settings" }} />

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Notification Settings</Text>

//         <View style={styles.settingItem}>
//           <View>
//             <Text style={styles.settingLabel}>Enable Notifications</Text>
//             <Text style={styles.settingDescription}>Turn on/off all birthday notifications</Text>
//           </View>
//           <Switch
//             value={localSettings.enableNotifications}
//             onValueChange={() => handleToggleChange("enableNotifications")}
//             trackColor={{ false: "#767577", true: "#4dabf7" }}
//             thumbColor={localSettings.enableNotifications ? "#fff" : "#f4f3f4"}
//           />
//         </View>

//         <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
//           <View>
//             <Text style={styles.settingLabel}>Day Before Reminder</Text>
//             <Text style={styles.settingDescription}>Send notification one day before birthday</Text>
//           </View>
//           <Switch
//             value={localSettings.enableDayBeforeNotification}
//             onValueChange={() => handleToggleChange("enableDayBeforeNotification")}
//             trackColor={{ false: "#767577", true: "#4dabf7" }}
//             thumbColor={localSettings.enableDayBeforeNotification ? "#fff" : "#f4f3f4"}
//             disabled={!localSettings.enableNotifications}
//           />
//         </View>

//         {localSettings.enableNotifications && localSettings.enableDayBeforeNotification && (
//           <View style={styles.timePickerContainer}>
//             <Text style={styles.timePickerLabel}>Notification Time:</Text>
//             <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowDayBeforeTimePicker(true)}>
//               <Text style={styles.timePickerButtonText}>{formatTimeString(localSettings.dayBeforeTime)}</Text>
//             </TouchableOpacity>

//             {showDayBeforeTimePicker && (
//               <DateTimePicker
//                 value={localSettings.dayBeforeTime}
//                 mode="time"
//                 is24Hour={false}
//                 display="default"
//                 onChange={handleDayBeforeTimeChange}
//               />
//             )}
//           </View>
//         )}

//         <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
//           <View>
//             <Text style={styles.settingLabel}>Birthday Day Notification</Text>
//             <Text style={styles.settingDescription}>Send notification on the birthday</Text>
//           </View>
//           <Switch
//             value={localSettings.enableDayOfNotification}
//             onValueChange={() => handleToggleChange("enableDayOfNotification")}
//             trackColor={{ false: "#767577", true: "#4dabf7" }}
//             thumbColor={localSettings.enableDayOfNotification ? "#fff" : "#f4f3f4"}
//             disabled={!localSettings.enableNotifications}
//           />
//         </View>

//         {localSettings.enableNotifications && localSettings.enableDayOfNotification && (
//           <View style={styles.timePickerContainer}>
//             <Text style={styles.timePickerLabel}>Notification Time:</Text>
//             <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowDayOfTimePicker(true)}>
//               <Text style={styles.timePickerButtonText}>{formatTimeString(localSettings.dayOfTime)}</Text>
//             </TouchableOpacity>

//             {showDayOfTimePicker && (
//               <DateTimePicker
//                 value={localSettings.dayOfTime}
//                 mode="time"
//                 is24Hour={false}
//                 display="default"
//                 onChange={handleDayOfTimeChange}
//               />
//             )}
//           </View>
//         )}

//         <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
//           <View>
//             <Text style={styles.settingLabel}>Sound</Text>
//             <Text style={styles.settingDescription}>Play sound with notifications</Text>
//           </View>
//           <Switch
//             value={localSettings.enableSound}
//             onValueChange={() => handleToggleChange("enableSound")}
//             trackColor={{ false: "#767577", true: "#4dabf7" }}
//             thumbColor={localSettings.enableSound ? "#fff" : "#f4f3f4"}
//             disabled={!localSettings.enableNotifications}
//           />
//         </View>

//         <View style={[styles.settingItem, !localSettings.enableNotifications && styles.disabledSetting]}>
//           <View>
//             <Text style={styles.settingLabel}>Vibration</Text>
//             <Text style={styles.settingDescription}>Vibrate with notifications</Text>
//           </View>
//           <Switch
//             value={localSettings.enableVibration}
//             onValueChange={() => handleToggleChange("enableVibration")}
//             trackColor={{ false: "#767577", true: "#4dabf7" }}
//             thumbColor={localSettings.enableVibration ? "#fff" : "#f4f3f4"}
//             disabled={!localSettings.enableNotifications}
//           />
//         </View>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Message Template</Text>
//         <Text style={styles.settingDescription}>Customize your default birthday message</Text>

//         <TextInput
//           style={styles.messageInput}
//           value={localSettings.defaultMessage}
//           onChangeText={handleMessageChange}
//           placeholder="Enter your default birthday message"
//           multiline
//           numberOfLines={3}
//           disabled={!localSettings.enableNotifications}
//         />

//         <Text style={styles.templateHint}>Use {"{name}"} to include the person's name in your message.</Text>
//       </View>

//       <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
//         <Text style={styles.saveButtonText}>Save Settings</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.rescheduleButton} onPress={rescheduleAllNotifications}>
//         <Text style={styles.rescheduleButtonText}>Reschedule All Notifications</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   settingItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f3f5",
//   },
//   disabledSetting: {
//     opacity: 0.5,
//   },
//   settingLabel: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   settingDescription: {
//     fontSize: 14,
//     color: "#6c757d",
//     marginTop: 4,
//   },
//   timePickerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingLeft: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f3f5",
//   },
//   timePickerLabel: {
//     fontSize: 14,
//     color: "#495057",
//     marginRight: 8,
//   },
//   timePickerButton: {
//     backgroundColor: "#e9ecef",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   timePickerButtonText: {
//     fontSize: 14,
//     color: "#495057",
//   },
//   messageInput: {
//     borderWidth: 1,
//     borderColor: "#ced4da",
//     borderRadius: 4,
//     padding: 12,
//     marginTop: 12,
//     fontSize: 16,
//     textAlignVertical: "top",
//   },
//   templateHint: {
//     fontSize: 12,
//     color: "#6c757d",
//     marginTop: 8,
//     fontStyle: "italic",
//   },
//   saveButton: {
//     backgroundColor: "#4dabf7",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   rescheduleButton: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#4dabf7",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   rescheduleButtonText: {
//     color: "#4dabf7",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// })
