import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert, Platform } from "react-native"
import type { Student } from "../types"
import { formatDate, calculateAge } from "../utils/dateUtils"
import { Phone, MessageSquare, Gift, Send } from "lucide-react-native"

interface BirthdayCardProps {
  student: Student
  onNotify?: (student: Student) => void
  showActions?: boolean
}

export function BirthdayCard({ student, onNotify, showActions = false }: BirthdayCardProps) {
  const handleCall = () => {
    Linking.openURL(`tel:${student.countryCode}${student.mobileNumber}`)
  }

  // const handleSMS = () => {
  //   Linking.openURL(`sms:${student.countryCode}${student.mobileNumber}&text=Happy%20Birthday%20😊😊😊`)
  // }

  const handleSMS = () => {
    const message = "Happy Birthday 😊😊😊"
    const encodedMessage = encodeURIComponent(message)

    // For iOS and Android compatibility
    const smsUrl =
      Platform.OS === "ios"
        ? `sms:${student.countryCode}${student.mobileNumber}&body=${encodedMessage}`
        : `sms:${student.countryCode}${student.mobileNumber}?body=${encodedMessage}`

    Linking.openURL(smsUrl)
  }

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${student.countryCode}${student.mobileNumber}&text=Happy%20Birthday%20😊😊😊`).catch(() => {
      Alert.alert("WhatsApp Not Installed", "WhatsApp is not installed on your device", [{ text: "OK" }])
    })
  }

  // const handleTelegram = () => {
  //   Linking.openURL(`tg://msg?to=${student.countryCode}${student.mobileNumber}`).catch(() => {
  //     // If deep linking fails, try web URL
  //     Linking.openURL(`https://t.me/${student.countryCode}${student.mobileNumber}&text=Happy%20Birthday%20😊😊😊`).catch(() => {
  //       Alert.alert("Telegram Not Installed", "Telegram is not installed on your device", [{ text: "OK" }])
  //     })
  //   })
  // }

  const handleTelegram = () => {
  const message = "Happy Birthday 😊😊😊"
  const phoneNumber = `${student.countryCode}${student.mobileNumber}`
  
  // Method 1: Try opening chat directly (most reliable)
  Linking.openURL(`tg://resolve?domain=${phoneNumber}&text=${encodeURIComponent(message)}`).catch(() => {
    // Method 2: Try web version with message
    // Linking.openURL(`https://t.me/+${phoneNumber}?text=${encodeURIComponent(message)}`).catch(() => {
    //   // Method 3: Try alternative web format
    //   Linking.openURL(`https://t.me/${phoneNumber}`).catch(() => {
    //     Alert.alert("Telegram Not Available", "Unable to open Telegram chat", [{ text: "OK" }])
    //   })
    // })
  })
}

  const handleNotify = () => {
    console.log("BirthdayCard - Notify button pressed for:", student.name)
    if (onNotify) {
      console.log("BirthdayCard - Calling onNotify function")
      onNotify(student)
    } else {
      console.log("BirthdayCard - onNotify function not provided")
      Alert.alert("Error", "Notification function not available")
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.age}>{calculateAge(new Date(student.birthDate))} years old</Text>
        </View>
        {showActions && (
          <TouchableOpacity style={styles.notifyButton} onPress={handleNotify}>
            <Gift size={16} color="#fff" />
            <Text style={styles.notifyButtonText}>Notify</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Roll Number:</Text>
          <Text style={styles.infoValue}>{student.rollNumber}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Birth Date:</Text>
          <Text style={styles.infoValue}>{formatDate(new Date(student.birthDate))}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>
            {student.countryCode}
            {student.mobileNumber}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Field of Study:</Text>
          <Text style={styles.infoValue}>{student.fieldOfStudy}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Branch:</Text>
          <Text style={styles.infoValue}>{student.branch}</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Phone size={18} color="#4dabf7" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
            <MessageSquare size={18} color="#4dabf7" />
            <Text style={styles.actionText}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <Send size={18} color="#25D366" />
            <Text style={[styles.actionText, { color: "#25D366" }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTelegram}>
            <Send size={18} color="#0088cc" />
            <Text style={[styles.actionText, { color: "#0088cc" }]}>Telegram</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  age: {
    fontSize: 14,
    color: "#6c757d",
  },
  notifyButton: {
    backgroundColor: "#4dabf7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  notifyButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: "50%",
  },
  actionText: {
    marginLeft: 8,
    color: "#4dabf7",
    fontWeight: "500",
  },
})



// import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from "react-native"
// import type { Student } from "../types"
// import { formatDate, calculateAge } from "../utils/dateUtils"
// import { Phone, MessageSquare, Gift, Send } from "lucide-react-native"

// interface BirthdayCardProps {
//   student: Student
//   onNotify?: (student: Student) => void
//   showActions?: boolean
// }

// export function BirthdayCard({ student, onNotify, showActions = false }: BirthdayCardProps) {
//   const handleCall = () => {
//     Linking.openURL(`tel:${student.countryCode}${student.mobileNumber}`)
//   }

//   const handleSMS = () => {
//     Linking.openURL(`sms:${student.countryCode}${student.mobileNumber}`)
//   }

//   const handleWhatsApp = () => {
//     Linking.openURL(`whatsapp://send?phone=${student.countryCode}${student.mobileNumber}&text=Happy%20Birthday%20😊😊😊`).catch(() => {
//       Alert.alert("WhatsApp Not Installed", "WhatsApp is not installed on your device", [{ text: "OK" }])
//     })
//   }

//   const handleTelegram = () => {
//     Linking.openURL(`tg://msg?to=${student.countryCode}${student.mobileNumber}`).catch(() => {
//       // If deep linking fails, try web URL
//       Linking.openURL(`https://t.me/${student.countryCode}${student.mobileNumber}`).catch(() => {
//         Alert.alert("Telegram Not Installed", "Telegram is not installed on your device", [{ text: "OK" }])
//       })
//     })
//   }

//   const handleNotify = () => {
//     if (onNotify) {
//       onNotify(student)
//     }
//   }

//   return (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={styles.nameContainer}>
//           <Text style={styles.name}>{student.name}</Text>
//           <Text style={styles.age}>{calculateAge(new Date(student.birthDate))} years old</Text>
//         </View>
//         {showActions && (
//           <TouchableOpacity style={styles.notifyButton} onPress={handleNotify}>
//             <Gift size={16} color="#fff" />
//             <Text style={styles.notifyButtonText}>Notify</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.infoContainer}>
//         <View style={styles.infoItem}>
//           <Text style={styles.infoLabel}>Roll Number:</Text>
//           <Text style={styles.infoValue}>{student.rollNumber}</Text>
//         </View>

//         <View style={styles.infoItem}>
//           <Text style={styles.infoLabel}>Birth Date:</Text>
//           <Text style={styles.infoValue}>{formatDate(new Date(student.birthDate))}</Text>
//         </View>

//         <View style={styles.infoItem}>
//           <Text style={styles.infoLabel}>Mobile:</Text>
//           <Text style={styles.infoValue}>
//             {student.countryCode}
//             {student.mobileNumber}
//           </Text>
//         </View>

//         <View style={styles.infoItem}>
//           <Text style={styles.infoLabel}>Field of Study:</Text>
//           <Text style={styles.infoValue}>{student.fieldOfStudy}</Text>
//         </View>

//         <View style={styles.infoItem}>
//           <Text style={styles.infoLabel}>Branch:</Text>
//           <Text style={styles.infoValue}>{student.branch}</Text>
//         </View>
//       </View>

//       {showActions && (
//         <View style={styles.actions}>
//           <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
//             <Phone size={18} color="#4dabf7" />
//             <Text style={styles.actionText}>Call</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
//             <MessageSquare size={18} color="#4dabf7" />
//             <Text style={styles.actionText}>SMS</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
//             <Send size={18} color="#25D366" />
//             <Text style={[styles.actionText, { color: "#25D366" }]}>WhatsApp</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} onPress={handleTelegram}>
//             <Send size={18} color="#0088cc" />
//             <Text style={[styles.actionText, { color: "#0088cc" }]}>Telegram</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   nameContainer: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   age: {
//     fontSize: 14,
//     color: "#6c757d",
//   },
//   notifyButton: {
//     backgroundColor: "#4dabf7",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   notifyButtonText: {
//     color: "#fff",
//     marginLeft: 4,
//     fontWeight: "500",
//   },
//   infoContainer: {
//     marginBottom: 12,
//   },
//   infoItem: {
//     flexDirection: "row",
//     marginBottom: 4,
//   },
//   infoLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     width: 100,
//   },
//   infoValue: {
//     fontSize: 14,
//     flex: 1,
//   },
//   actions: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#e9ecef",
//     paddingTop: 12,
//     flexWrap: "wrap",
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     minWidth: "50%",
//   },
//   actionText: {
//     marginLeft: 8,
//     color: "#4dabf7",
//     fontWeight: "500",
//   },
// })
