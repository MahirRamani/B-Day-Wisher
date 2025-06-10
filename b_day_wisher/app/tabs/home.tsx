"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, FlatList, RefreshControl, Alert, TouchableOpacity } from "react-native"
import { useBirthdayStore } from "../../store/birthdayStore"
import { useNotificationStore } from "../../store/notificationStore"
import { BirthdayCard } from "../../components/BirthdayCard"
import { formatDate } from "../../utils/dateUtils"
import type { Student } from "../../types"
import { Stack } from "expo-router"

export default function HomeScreen() {
  const { todayBirthdays, tomorrowBirthdays, fetchTodayTomorrowBirthdays, loading, clearCache } = useBirthdayStore()
  const { scheduleCustomNotification } = useNotificationStore()
  const [refreshing, setRefreshing] = useState(false)

  // Debug effect to log state changes
  useEffect(() => {
    console.log("Home screen - Today's birthdays:", todayBirthdays.length)
    console.log("Home screen - Tomorrow's birthdays:", tomorrowBirthdays.length)
  }, [todayBirthdays, tomorrowBirthdays])

  const onRefresh = async () => {
    console.log("Refreshing home screen...")
    setRefreshing(true)
    try {
      await fetchTodayTomorrowBirthdays()
    } catch (error) {
      console.error("Error refreshing:", error)
    }
    setRefreshing(false)
  }

  const handleClearCache = async () => {
    Alert.alert("Clear Cache", "This will clear all cached data and reload fresh data. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          await clearCache()
          await onRefresh()
        },
      },
    ])
  }

  const handleSendCustomNotification = (student: Student) => {
    console.log("Sending notification for:", student.name)
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
            if (message) {
              scheduleCustomNotification(student, message)
              Alert.alert("Success", "Custom notification sent!")
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
      <Stack.Screen options={{ headerShown: true, title: "Today's Birthdays" }} />

      <FlatList
        data={[
          { title: "Today's Birthdays", data: todayBirthdays, id: "today" },
          { title: "Tomorrow's Birthdays", data: tomorrowBirthdays, id: "tomorrow" },
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.data.length > 0 ? (
              <FlatList
                data={item.data}
                keyExtractor={(student) => student.rollNumber}
                renderItem={({ item: student }) => (
                  <BirthdayCard
                    student={student}
                    onNotify={(student) => handleSendCustomNotification(student)}
                    showActions
                  />
                )}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No birthdays {item.id === "today" ? "today" : "tomorrow"}</Text>
              </View>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {todayBirthdays.length > 0
                ? `${todayBirthdays.length} ${todayBirthdays.length === 1 ? "person has" : "people have"} their birthday today!`
                : "No birthdays today"}
            </Text>
            <Text style={styles.dateText}>{formatDate(new Date())}</Text>

            {/* Debug button - remove in production */}
            <TouchableOpacity style={styles.debugButton} onPress={handleClearCache}>
              <Text style={styles.debugButtonText}>Clear Cache & Reload</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  debugButton: {
    backgroundColor: "#ff6b6b",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  debugButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
})



// "use client"

// import { useState } from "react"
// import { StyleSheet, Text, View, FlatList, RefreshControl, Alert } from "react-native"
// import { useBirthdayStore } from "../../store/birthdayStore"
// import { useNotificationStore } from "../../store/notificationStore"
// import { BirthdayCard } from "../../components/BirthdayCard"
// import { formatDate } from "../../utils/dateUtils"
// import type { Student } from "../../types"
// import { Stack } from "expo-router"

// export default function HomeScreen() {
//   const { todayBirthdays, tomorrowBirthdays, fetchTodayTomorrowBirthdays, loading } = useBirthdayStore()
//   const { scheduleCustomNotification } = useNotificationStore()
//   const [refreshing, setRefreshing] = useState(false)

//   const onRefresh = async () => {
//     setRefreshing(true)
//     await fetchTodayTomorrowBirthdays()
//     setRefreshing(false)
//   }

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
//       <Stack.Screen options={{ headerShown: true, title: "Today's Birthdays" }} />

//       <FlatList
//         data={[
//           { title: "Today's Birthdays", data: todayBirthdays, id: "today" },
//           { title: "Tomorrow's Birthdays", data: tomorrowBirthdays, id: "tomorrow" },
//         ]}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>{item.title}</Text>
//             {item.data.length > 0 ? (
//               <FlatList
//                 data={item.data}
//                 keyExtractor={(student) => student.rollNumber}
//                 renderItem={({ item: student }) => (
//                   <BirthdayCard
//                     student={student}
//                     onNotify={(student) => handleSendCustomNotification(student)}
//                     showActions
//                   />
//                 )}
//                 scrollEnabled={false}
//               />
//             ) : (
//               <View style={styles.emptyContainer}>
//                 <Text style={styles.emptyText}>No birthdays {item.id === "today" ? "today" : "tomorrow"}</Text>
//               </View>
//             )}
//           </View>
//         )}
//         refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <Text style={styles.headerText}>
//               {todayBirthdays.length > 0
//                 ? `${todayBirthdays.length} ${todayBirthdays.length === 1 ? "person has" : "people have"} their birthday today!`
//                 : "No birthdays today"}
//             </Text>
//             <Text style={styles.dateText}>{formatDate(new Date())}</Text>
//           </View>
//         }
//       />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     padding: 16,
//     backgroundColor: "#fff",
//     marginBottom: 8,
//     borderRadius: 8,
//     marginHorizontal: 16,
//     marginTop: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   dateText: {
//     fontSize: 16,
//     textAlign: "center",
//     color: "#666",
//   },
//   section: {
//     marginBottom: 16,
//     paddingHorizontal: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//     marginLeft: 4,
//   },
//   emptyContainer: {
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#666",
//   },
// })
