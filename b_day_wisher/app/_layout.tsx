"use client"

import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ThemeProvider } from "../components/theme-provider"
import { useBirthdayStore } from "../store/birthdayStore"
import { useNotificationStore } from "../store/notificationStore"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })

  const { fetchBirthdays, fetchTodayTomorrowBirthdays } = useBirthdayStore()
  const { initializeNotifications } = useNotificationStore()

  // Load initial data and set up notifications
  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log("Setting up app...")

        // Clear old cache data to ensure fresh start
        await AsyncStorage.removeItem("allBirthdays")
        await AsyncStorage.removeItem("todayTomorrowBirthdays")
        console.log("Cleared cache data")

        // Request notification permissions
        await initializeNotifications()
        console.log("Initialized notifications")

        // Fetch all birthdays first
        await fetchBirthdays()
        console.log("Fetched all birthdays")

        // Then fetch today and tomorrow birthdays
        await fetchTodayTomorrowBirthdays()
        console.log("Fetched today/tomorrow birthdays")
      } catch (error) {
        console.error("Error setting up app:", error)
      }
    }

    setupApp()
  }, [])

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

// "use client"

// import FontAwesome from "@expo/vector-icons/FontAwesome"
// import { useFonts } from "expo-font"
// import { Stack } from "expo-router"
// import * as SplashScreen from "expo-splash-screen"
// import { useEffect } from "react"
// import { GestureHandlerRootView } from "react-native-gesture-handler"
// import { ThemeProvider } from "../components/theme-provider"
// import { useBirthdayStore } from "../store/birthdayStore"
// import { useNotificationStore } from "../store/notificationStore"
// import * as Notifications from "expo-notifications"

// // Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync()

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// })

// export default function RootLayout() {
//   const [loaded, error] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//     ...FontAwesome.font,
//   })

//   const { fetchBirthdays, fetchTodayTomorrowBirthdays } = useBirthdayStore()
//   const { initializeNotifications } = useNotificationStore()

//   // Load initial data and set up notifications
//   useEffect(() => {
//     const setupApp = async () => {
//       try {
//         // Request notification permissions
//         await initializeNotifications()

//         // Fetch all birthdays
//         await fetchBirthdays()

//         // Fetch today and tomorrow birthdays specifically
//         await fetchTodayTomorrowBirthdays()
//       } catch (error) {
//         console.error("Error setting up app:", error)
//       }
//     }

//     setupApp()
//   }, [])

//   // Expo Router uses Error Boundaries to catch errors in the navigation tree.
//   useEffect(() => {
//     if (error) throw error
//   }, [error])

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync()
//     }
//   }, [loaded])

//   if (!loaded) {
//     return null
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider>
//         <Stack screenOptions={{ headerShown: false }} />
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   )
// }
