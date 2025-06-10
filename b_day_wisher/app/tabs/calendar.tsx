"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, FlatList } from "react-native"
import { Calendar } from "react-native-calendars"
import { useBirthdayStore } from "../../store/birthdayStore"
import { BirthdayCard } from "../../components/BirthdayCard"
import { formatDate, formatDateForCalendar } from "../../utils/dateUtils"
import { Stack } from "expo-router"
import { useNotificationStore } from "../../store/notificationStore"
import { Alert } from "react-native"
import type { Student } from "../../types"

// Define the MarkedDates type ourselves
interface MarkedDate {
  selected?: boolean
  marked?: boolean
  selectedColor?: string
  dotColor?: string
  activeOpacity?: number
  disabled?: boolean
  disableTouchEvent?: boolean
  textColor?: string
  customStyles?: {
    container?: object
    text?: object
  }
}

interface MarkedDates {
  [date: string]: MarkedDate
}

export default function CalendarScreen() {
  const { birthdays } = useBirthdayStore()
  const { scheduleCustomNotification } = useNotificationStore()
  const [selectedDate, setSelectedDate] = useState(formatDateForCalendar(new Date()))

  // Debug effect
  useEffect(() => {
    console.log("Calendar screen - Total birthdays:", birthdays.length)
  }, [birthdays])

  // Create marked dates object for calendar
  const markedDates: MarkedDates = birthdays.reduce(
    (acc: MarkedDates, student: Student) => {
      const birthDate = new Date(student.birthDate)
      const currentYear = new Date().getFullYear()

      // Set the birth date to current year for marking on calendar
      birthDate.setFullYear(currentYear)
      const dateString = formatDateForCalendar(birthDate)

      return {
        ...acc,
        [dateString]: {
          marked: true,
          dotColor: "#ff6b6b",
          ...(dateString === selectedDate ? { selected: true, selectedColor: "#4dabf7" } : {}),
        },
      }
    },
    {
      [selectedDate]: { selected: true, selectedColor: "#4dabf7" },
    } as MarkedDates,
  )

  // Filter birthdays for selected date (ignoring year)
  const selectedBirthdays = birthdays.filter((student) => {
    const birthDate = new Date(student.birthDate)
    const selectedDateObj = new Date(selectedDate)

    return birthDate.getDate() === selectedDateObj.getDate() && birthDate.getMonth() === selectedDateObj.getMonth()
  })

  const handleSendCustomNotification = (student: Student) => {
    console.log("Calendar - Sending notification for:", student.name)

    Alert.prompt(
      "Send Custom Notification",
      `Send a custom birthday message to ${student.name}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send",
          onPress: (message) => {
            if (message && message.trim()) {
              console.log("Scheduling notification with message:", message)
              scheduleCustomNotification(student, message)
              Alert.alert("Success", "Custom notification sent!")
            } else {
              Alert.alert("Error", "Please enter a message")
            }
          },
        },
      ],
      "plain-text",
      `Happy Birthday ${student.name}! 🎉`,
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "Birthday Calendar" }} />

      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          todayTextColor: "#4dabf7",
          arrowColor: "#4dabf7",
          dotColor: "#ff6b6b",
          selectedDayBackgroundColor: "#4dabf7",
        }}
      />

      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>Birthdays on {formatDate(new Date(selectedDate))}</Text>
        <Text style={styles.debugText}>Found {selectedBirthdays.length} birthdays</Text>
      </View>

      {selectedBirthdays.length > 0 ? (
        <FlatList
          data={selectedBirthdays}
          keyExtractor={(item) => item.rollNumber}
          renderItem={({ item }) => <BirthdayCard student={item} onNotify={handleSendCustomNotification} showActions />}
          contentContainerStyle={styles.birthdayList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No birthdays on this date</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  selectedDateContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  birthdayList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
})



// "use client"

// import { useState } from "react"
// import { StyleSheet, Text, View, FlatList } from "react-native"
// import { Calendar } from "react-native-calendars"
// import { useBirthdayStore } from "../../store/birthdayStore"
// import { BirthdayCard } from "../../components/BirthdayCard"
// import { formatDate, formatDateForCalendar } from "../../utils/dateUtils"
// import { Stack } from "expo-router"
// import { useNotificationStore } from "../../store/notificationStore"
// import { Alert } from "react-native"
// import type { Student } from "../../types"

// // Define the MarkedDates type ourselves
// interface MarkedDate {
//   selected?: boolean
//   marked?: boolean
//   selectedColor?: string
//   dotColor?: string
//   activeOpacity?: number
//   disabled?: boolean
//   disableTouchEvent?: boolean
//   textColor?: string
//   customStyles?: {
//     container?: object
//     text?: object
//   }
// }

// interface MarkedDates {
//   [date: string]: MarkedDate
// }

// export default function CalendarScreen() {
//   const { birthdays } = useBirthdayStore()
//   const { scheduleCustomNotification } = useNotificationStore()
//   const [selectedDate, setSelectedDate] = useState(formatDateForCalendar(new Date()))

//   // Create marked dates object for calendar
//   const markedDates: MarkedDates = birthdays.reduce(
//     (acc: MarkedDates, student: Student) => {
//       const birthDate = new Date(student.birthDate)
//       const currentYear = new Date().getFullYear()

//       // Set the birth date to current year for marking on calendar
//       birthDate.setFullYear(currentYear)
//       const dateString = formatDateForCalendar(birthDate)

//       return {
//         ...acc,
//         [dateString]: {
//           marked: true,
//           dotColor: "#ff6b6b",
//           ...(dateString === selectedDate ? { selected: true, selectedColor: "#4dabf7" } : {}),
//         },
//       }
//     },
//     {
//       [selectedDate]: { selected: true, selectedColor: "#4dabf7" },
//     } as MarkedDates,
//   )

//   // Filter birthdays for selected date (ignoring year)
//   const selectedBirthdays = birthdays.filter((student) => {
//     const birthDate = new Date(student.birthDate)
//     const selectedDateObj = new Date(selectedDate)

//     return birthDate.getDate() === selectedDateObj.getDate() && birthDate.getMonth() === selectedDateObj.getMonth()
//   })

//   const handleSendCustomNotification = (student: Student) => {
//     Alert.prompt(
//       "Send Custom Notification",
//       `Send a custom birthday message to ${student.name}`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Send",
//           onPress: (message) => {
//             if (message) {
//               scheduleCustomNotification(student, message)
//               Alert.alert("Success", "Custom notification sent!")
//             }
//           },
//         },
//       ],
//       "plain-text",
//       `Happy Birthday ${student.name}! 🎉`,
//     )
//   }

//   return (
//     <View style={styles.container}>
//       <Stack.Screen options={{ headerShown: true, title: "Birthday Calendar" }} />

//       <Calendar
//         markedDates={markedDates}
//         onDayPress={(day) => setSelectedDate(day.dateString)}
//         theme={{
//           todayTextColor: "#4dabf7",
//           arrowColor: "#4dabf7",
//           dotColor: "#ff6b6b",
//           selectedDayBackgroundColor: "#4dabf7",
//         }}
//       />

//       <View style={styles.selectedDateContainer}>
//         <Text style={styles.selectedDateText}>Birthdays on {formatDate(new Date(selectedDate))}</Text>
//       </View>

//       {selectedBirthdays.length > 0 ? (
//         <FlatList
//           data={selectedBirthdays}
//           keyExtractor={(item) => item.rollNumber}
//           renderItem={({ item }) => (
//             <BirthdayCard student={item} onNotify={(student) => handleSendCustomNotification(student)} showActions />
//           )}
//           contentContainerStyle={styles.birthdayList}
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No birthdays on this date</Text>
//         </View>
//       )}
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   selectedDateContainer: {
//     padding: 16,
//     backgroundColor: "#fff",
//     marginVertical: 8,
//     marginHorizontal: 16,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   selectedDateText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   birthdayList: {
//     paddingHorizontal: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#666",
//   },
// })
