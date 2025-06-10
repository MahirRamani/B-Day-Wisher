import { create } from "zustand"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Student } from "../types"
import { useBirthdayStore } from "./birthdayStore"
import { v4 as uuidv4 } from "uuid"

interface NotificationSettings {
  enableNotifications: boolean
  enableDayBeforeNotification: boolean
  enableDayOfNotification: boolean
  enableSound: boolean
  enableVibration: boolean
  dayBeforeTime: Date
  dayOfTime: Date
  defaultMessage: string
}

interface NotificationItem {
  id: string
  studentName: string
  studentId: string
  message: string
  type: "day-before" | "day-of" | "custom"
  scheduledTime: string
  sentTime?: string
  notificationId?: string
}

interface NotificationState {
  settings: NotificationSettings
  sentNotifications: NotificationItem[]
  pendingNotifications: NotificationItem[]

  initializeNotifications: () => Promise<void>
  updateSettings: (settings: NotificationSettings) => Promise<void>
  scheduleNotificationsForBirthday: (student: Student) => Promise<void>
  scheduleCustomNotification: (student: Student, message: string) => Promise<void>
  cancelNotification: (id: string) => Promise<void>
  rescheduleAllNotifications: () => Promise<void>
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableNotifications: true,
  enableDayBeforeNotification: true,
  enableDayOfNotification: true,
  enableSound: true,
  enableVibration: true,
  dayBeforeTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM
  dayOfTime: new Date(new Date().setHours(6, 0, 0, 0)), // 6:00 AM
  defaultMessage: "Happy Birthday {name}! 🎂 Wishing you a fantastic day filled with joy and celebration! 🎉",
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  sentNotifications: [],
  pendingNotifications: [],

  initializeNotifications: async (): Promise<void> => {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        console.log("Notification permissions not granted")
        return
      }

      // Load settings from storage
      const storedSettings = await AsyncStorage.getItem("notificationSettings")
      const settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS

      // Convert date strings back to Date objects
      if (typeof settings.dayBeforeTime === "string") {
        settings.dayBeforeTime = new Date(settings.dayBeforeTime)
      }
      if (typeof settings.dayOfTime === "string") {
        settings.dayOfTime = new Date(settings.dayOfTime)
      }

      // Load notification history
      const storedSentNotifications = await AsyncStorage.getItem("sentNotifications")
      const sentNotifications = storedSentNotifications ? JSON.parse(storedSentNotifications) : []

      const storedPendingNotifications = await AsyncStorage.getItem("pendingNotifications")
      const pendingNotifications = storedPendingNotifications ? JSON.parse(storedPendingNotifications) : []

      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: settings.enableSound,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })

      // Listen for notifications
      Notifications.addNotificationReceivedListener((notification) => {
        const notificationId = notification.request.identifier
        const pendingNotification = pendingNotifications.find(
          (n: NotificationItem) => n.notificationId === notificationId,
        )

        if (pendingNotification) {
          // Move from pending to sent
          const updatedPendingNotifications = pendingNotifications.filter(
            (n: NotificationItem) => n.notificationId !== notificationId,
          )

          const updatedSentNotifications = [
            ...sentNotifications,
            {
              ...pendingNotification,
              sentTime: new Date().toISOString(),
            },
          ]

          // Update storage
          AsyncStorage.setItem("pendingNotifications", JSON.stringify(updatedPendingNotifications))
          AsyncStorage.setItem("sentNotifications", JSON.stringify(updatedSentNotifications))

          // Update state
          set({
            pendingNotifications: updatedPendingNotifications,
            sentNotifications: updatedSentNotifications,
          })
        }
      })

      set({ settings, sentNotifications, pendingNotifications })
    } catch (error) {
      console.error("Error initializing notifications:", error)
    }
  },

  updateSettings: async (newSettings) => {
    try {
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings))
      set({ settings: newSettings })
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  },

  scheduleNotificationsForBirthday: async (student) => {
    const { settings } = get()

    if (!settings.enableNotifications) {
      return
    }

    try {
      const birthDate = new Date(student.birthDate)
      const now = new Date()

      // Set birth date to current year
      birthDate.setFullYear(now.getFullYear())

      // If birthday has passed this year, set to next year
      if (birthDate < now) {
        birthDate.setFullYear(now.getFullYear() + 1)
      }

      const pendingNotifications = [...get().pendingNotifications]

      // Schedule day before notification
      if (settings.enableDayBeforeNotification) {
        const dayBeforeDate = new Date(birthDate)
        dayBeforeDate.setDate(dayBeforeDate.getDate() - 1)
        dayBeforeDate.setHours(settings.dayBeforeTime.getHours(), settings.dayBeforeTime.getMinutes(), 0, 0)

        if (dayBeforeDate > now) {
          const message = `${student.name} has a birthday tomorrow! 🎂`

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Birthday Reminder",
              body: message,
              data: { student },
              sound: settings.enableSound,
              vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: dayBeforeDate,
            },
          })

          const notification: NotificationItem = {
            id: uuidv4(),
            studentName: student.name,
            studentId: student.rollNumber,
            message,
            type: "day-before",
            scheduledTime: dayBeforeDate.toISOString(),
            notificationId,
          }

          pendingNotifications.push(notification)
        }
      }

      // Schedule day of notification
      if (settings.enableDayOfNotification) {
        const dayOfDate = new Date(birthDate)
        dayOfDate.setHours(settings.dayOfTime.getHours(), settings.dayOfTime.getMinutes(), 0, 0)

        if (dayOfDate > now) {
          const message = settings.defaultMessage.replace("{name}", student.name)

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `Happy Birthday ${student.name}! 🎉`,
              body: message,
              data: { student },
              sound: settings.enableSound,
              vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: dayOfDate,
            },
          })

          const notification: NotificationItem = {
            id: uuidv4(),
            studentName: student.name,
            studentId: student.rollNumber,
            message,
            type: "day-of",
            scheduledTime: dayOfDate.toISOString(),
            notificationId,
          }

          pendingNotifications.push(notification)
        }
      }

      // Save pending notifications
      await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
      set({ pendingNotifications })
    } catch (error) {
      console.error("Error scheduling notifications:", error)
    }
  },

  scheduleCustomNotification: async (student, message) => {
    try {
      const { settings } = get()

      // Schedule for 5 seconds from now
      const scheduledTime = new Date(Date.now() + 5000)

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Message for ${student.name}`,
          body: message,
          data: { student },
          sound: settings.enableSound,
          vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      })

      const notification: NotificationItem = {
        id: uuidv4(),
        studentName: student.name,
        studentId: student.rollNumber,
        message,
        type: "custom",
        scheduledTime: scheduledTime.toISOString(),
        notificationId,
      }

      const pendingNotifications = [...get().pendingNotifications, notification]
      await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
      set({ pendingNotifications })
    } catch (error) {
      console.error("Error scheduling custom notification:", error)
    }
  },

  cancelNotification: async (id) => {
    try {
      const pendingNotifications = [...get().pendingNotifications]
      const notificationIndex = pendingNotifications.findIndex((n) => n.id === id)

      if (notificationIndex !== -1) {
        const notification = pendingNotifications[notificationIndex]

        if (notification.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notification.notificationId)
        }

        pendingNotifications.splice(notificationIndex, 1)
        await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
        set({ pendingNotifications })
      }
    } catch (error) {
      console.error("Error canceling notification:", error)
    }
  },

  rescheduleAllNotifications: async () => {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync()

      // Clear pending notifications
      await AsyncStorage.setItem("pendingNotifications", JSON.stringify([]))
      set({ pendingNotifications: [] })

      // Reschedule for all birthdays
      const { birthdays } = useBirthdayStore.getState()

      for (const student of birthdays) {
        await get().scheduleNotificationsForBirthday(student)
      }
    } catch (error) {
      console.error("Error rescheduling notifications:", error)
    }
  },
}))

// import { create } from "zustand"
// import * as Notifications from "expo-notifications"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import type { Student } from "../types"
// import { useBirthdayStore } from "./birthdayStore"
// import { v4 as uuidv4 } from "uuid"

// interface NotificationSettings {
//   enableNotifications: boolean
//   enableDayBeforeNotification: boolean
//   enableDayOfNotification: boolean
//   enableSound: boolean
//   enableVibration: boolean
//   dayBeforeTime: Date
//   dayOfTime: Date
//   defaultMessage: string
// }

// interface NotificationItem {
//   id: string
//   studentName: string
//   studentId: string
//   message: string
//   type: "day-before" | "day-of" | "custom"
//   scheduledTime: string
//   sentTime?: string
//   notificationId?: string
// }

// interface NotificationState {
//   settings: NotificationSettings
//   sentNotifications: NotificationItem[]
//   pendingNotifications: NotificationItem[]

//   initializeNotifications: () => Promise<void>
//   updateSettings: (settings: NotificationSettings) => Promise<void>
//   scheduleNotificationsForBirthday: (student: Student) => Promise<void>
//   scheduleCustomNotification: (student: Student, message: string) => Promise<void>
//   cancelNotification: (id: string) => Promise<void>
//   rescheduleAllNotifications: () => Promise<void>
// }

// const DEFAULT_SETTINGS: NotificationSettings = {
//   enableNotifications: true,
//   enableDayBeforeNotification: true,
//   enableDayOfNotification: true,
//   enableSound: true,
//   enableVibration: true,
//   dayBeforeTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM
//   dayOfTime: new Date(new Date().setHours(6, 0, 0, 0)), // 6:00 AM
//   defaultMessage: "Happy Birthday {name}! 🎂 Wishing you a fantastic day filled with joy and celebration! 🎉",
// }

// export const useNotificationStore = create<NotificationState>((set, get) => ({
//   settings: DEFAULT_SETTINGS,
//   sentNotifications: [],
//   pendingNotifications: [],

//   initializeNotifications: async (): Promise<void> => {
//     try {
//       // Request permissions
//       const { status } = await Notifications.requestPermissionsAsync()
//       if (status !== "granted") {
//         console.log("Notification permissions not granted")
//         return
//       }

//       // Load settings from storage
//       const storedSettings = await AsyncStorage.getItem("notificationSettings")
//       const settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS

//       // Convert date strings back to Date objects
//       if (typeof settings.dayBeforeTime === "string") {
//         settings.dayBeforeTime = new Date(settings.dayBeforeTime)
//       }
//       if (typeof settings.dayOfTime === "string") {
//         settings.dayOfTime = new Date(settings.dayOfTime)
//       }

//       // Load notification history
//       const storedSentNotifications = await AsyncStorage.getItem("sentNotifications")
//       const sentNotifications = storedSentNotifications ? JSON.parse(storedSentNotifications) : []

//       const storedPendingNotifications = await AsyncStorage.getItem("pendingNotifications")
//       const pendingNotifications = storedPendingNotifications ? JSON.parse(storedPendingNotifications) : []

//       // Set up notification handler
//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: settings.enableSound,
//           shouldSetBadge: true,
//           shouldShowBanner: true,
//           shouldShowList: true,
//         }),
//       })

//       // Listen for notifications
//       Notifications.addNotificationReceivedListener((notification) => {
//         const notificationId = notification.request.identifier
//         const pendingNotification = pendingNotifications.find(
//           (n: NotificationItem) => n.notificationId === notificationId,
//         )

//         if (pendingNotification) {
//           // Move from pending to sent
//           const updatedPendingNotifications = pendingNotifications.filter(
//             (n: NotificationItem) => n.notificationId !== notificationId,
//           )

//           const updatedSentNotifications = [
//             ...sentNotifications,
//             {
//               ...pendingNotification,
//               sentTime: new Date().toISOString(),
//             },
//           ]

//           // Update storage
//           AsyncStorage.setItem("pendingNotifications", JSON.stringify(updatedPendingNotifications))
//           AsyncStorage.setItem("sentNotifications", JSON.stringify(updatedSentNotifications))

//           // Update state
//           set({
//             pendingNotifications: updatedPendingNotifications,
//             sentNotifications: updatedSentNotifications,
//           })
//         }
//       })

//       set({ settings, sentNotifications, pendingNotifications })
//     } catch (error) {
//       console.error("Error initializing notifications:", error)
//     }
//   },

//   updateSettings: async (newSettings) => {
//     try {
//       await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings))
//       set({ settings: newSettings })
//     } catch (error) {
//       console.error("Error updating settings:", error)
//     }
//   },

//   scheduleNotificationsForBirthday: async (student) => {
//     const { settings } = get()

//     if (!settings.enableNotifications) {
//       return
//     }

//     try {
//       const birthDate = new Date(student.birthDate)
//       const now = new Date()

//       // Set birth date to current year
//       birthDate.setFullYear(now.getFullYear())

//       // If birthday has passed this year, set to next year
//       if (birthDate < now) {
//         birthDate.setFullYear(now.getFullYear() + 1)
//       }

//       const pendingNotifications = [...get().pendingNotifications]

//       // Schedule day before notification
//       if (settings.enableDayBeforeNotification) {
//         const dayBeforeDate = new Date(birthDate)
//         dayBeforeDate.setDate(dayBeforeDate.getDate() - 1)
//         dayBeforeDate.setHours(settings.dayBeforeTime.getHours(), settings.dayBeforeTime.getMinutes(), 0, 0)

//         if (dayBeforeDate > now) {
//           const message = `${student.name} has a birthday tomorrow! 🎂`

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: "Birthday Reminder",
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: {
//               date: dayBeforeDate,
//             },
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-before",
//             scheduledTime: dayBeforeDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Schedule day of notification
//       if (settings.enableDayOfNotification) {
//         const dayOfDate = new Date(birthDate)
//         dayOfDate.setHours(settings.dayOfTime.getHours(), settings.dayOfTime.getMinutes(), 0, 0)

//         if (dayOfDate > now) {
//           const message = settings.defaultMessage.replace("{name}", student.name)

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: `Happy Birthday ${student.name}! 🎉`,
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: {
//               date: dayOfDate,
//             },
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-of",
//             scheduledTime: dayOfDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Save pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling notifications:", error)
//     }
//   },

//   scheduleCustomNotification: async (student, message) => {
//     try {
//       const { settings } = get()

//       // Schedule for 5 seconds from now
//       const scheduledTime = new Date(Date.now() + 5000)

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: `Message for ${student.name}`,
//           body: message,
//           data: { student },
//           sound: settings.enableSound,
//           vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//         },
//         trigger: {
//           date: scheduledTime,
//         },
//       })

//       const notification: NotificationItem = {
//         id: uuidv4(),
//         studentName: student.name,
//         studentId: student.rollNumber,
//         message,
//         type: "custom",
//         scheduledTime: scheduledTime.toISOString(),
//         notificationId,
//       }

//       const pendingNotifications = [...get().pendingNotifications, notification]
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling custom notification:", error)
//     }
//   },

//   cancelNotification: async (id) => {
//     try {
//       const pendingNotifications = [...get().pendingNotifications]
//       const notificationIndex = pendingNotifications.findIndex((n) => n.id === id)

//       if (notificationIndex !== -1) {
//         const notification = pendingNotifications[notificationIndex]

//         if (notification.notificationId) {
//           await Notifications.cancelScheduledNotificationAsync(notification.notificationId)
//         }

//         pendingNotifications.splice(notificationIndex, 1)
//         await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//         set({ pendingNotifications })
//       }
//     } catch (error) {
//       console.error("Error canceling notification:", error)
//     }
//   },

//   rescheduleAllNotifications: async () => {
//     try {
//       // Cancel all existing notifications
//       await Notifications.cancelAllScheduledNotificationsAsync()

//       // Clear pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify([]))
//       set({ pendingNotifications: [] })

//       // Reschedule for all birthdays
//       const { birthdays } = useBirthdayStore.getState()

//       for (const student of birthdays) {
//         await get().scheduleNotificationsForBirthday(student)
//       }
//     } catch (error) {
//       console.error("Error rescheduling notifications:", error)
//     }
//   },
// }))

// import { create } from "zustand"
// import * as Notifications from "expo-notifications"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import type { Student } from "../types"
// import { useBirthdayStore } from "./birthdayStore"
// import { v4 as uuidv4 } from "uuid"

// interface NotificationSettings {
//   enableNotifications: boolean
//   enableDayBeforeNotification: boolean
//   enableDayOfNotification: boolean
//   enableSound: boolean
//   enableVibration: boolean
//   dayBeforeTime: Date
//   dayOfTime: Date
//   defaultMessage: string
// }

// interface NotificationItem {
//   id: string
//   studentName: string
//   studentId: string
//   message: string
//   type: "day-before" | "day-of" | "custom"
//   scheduledTime: string
//   sentTime?: string
//   notificationId?: string
// }

// interface NotificationState {
//   settings: NotificationSettings
//   sentNotifications: NotificationItem[]
//   pendingNotifications: NotificationItem[]

//   initializeNotifications: () => Promise<void>
//   updateSettings: (settings: NotificationSettings) => Promise<void>
//   scheduleNotificationsForBirthday: (student: Student) => Promise<void>
//   scheduleCustomNotification: (student: Student, message: string) => Promise<void>
//   cancelNotification: (id: string) => Promise<void>
//   rescheduleAllNotifications: () => Promise<void>
// }

// const DEFAULT_SETTINGS: NotificationSettings = {
//   enableNotifications: true,
//   enableDayBeforeNotification: true,
//   enableDayOfNotification: true,
//   enableSound: true,
//   enableVibration: true,
//   dayBeforeTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM
//   dayOfTime: new Date(new Date().setHours(6, 0, 0, 0)), // 6:00 AM
//   defaultMessage: "Happy Birthday {name}! 🎂 Wishing you a fantastic day filled with joy and celebration! 🎉",
// }

// export const useNotificationStore = create<NotificationState>((set, get) => ({
//   settings: DEFAULT_SETTINGS,
//   sentNotifications: [],
//   pendingNotifications: [],

//   initializeNotifications: async (): Promise<void> => {
//     try {
//       // Request permissions
//       const { status } = await Notifications.requestPermissionsAsync()
//       if (status !== "granted") {
//         console.log("Notification permissions not granted")
//         return
//       }

//       // Load settings from storage
//       const storedSettings = await AsyncStorage.getItem("notificationSettings")
//       const settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS

//       // Convert date strings back to Date objects
//       if (typeof settings.dayBeforeTime === "string") {
//         settings.dayBeforeTime = new Date(settings.dayBeforeTime)
//       }
//       if (typeof settings.dayOfTime === "string") {
//         settings.dayOfTime = new Date(settings.dayOfTime)
//       }

//       // Load notification history
//       const storedSentNotifications = await AsyncStorage.getItem("sentNotifications")
//       const sentNotifications = storedSentNotifications ? JSON.parse(storedSentNotifications) : []

//       const storedPendingNotifications = await AsyncStorage.getItem("pendingNotifications")
//       const pendingNotifications = storedPendingNotifications ? JSON.parse(storedPendingNotifications) : []

//       // Set up notification handler
//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: settings.enableSound,
//           shouldSetBadge: true,
//           shouldShowBanner: true,
//           shouldShowList: true,
//         }),
//       })

//       // Listen for notifications
//       Notifications.addNotificationReceivedListener((notification) => {
//         const notificationId = notification.request.identifier
//         const pendingNotification = pendingNotifications.find(
//           (n: NotificationItem) => n.notificationId === notificationId,
//         )

//         if (pendingNotification) {
//           // Move from pending to sent
//           const updatedPendingNotifications = pendingNotifications.filter(
//             (n: NotificationItem) => n.notificationId !== notificationId,
//           )

//           const updatedSentNotifications = [
//             ...sentNotifications,
//             {
//               ...pendingNotification,
//               sentTime: new Date().toISOString(),
//             },
//           ]

//           // Update storage
//           AsyncStorage.setItem("pendingNotifications", JSON.stringify(updatedPendingNotifications))
//           AsyncStorage.setItem("sentNotifications", JSON.stringify(updatedSentNotifications))

//           // Update state
//           set({
//             pendingNotifications: updatedPendingNotifications,
//             sentNotifications: updatedSentNotifications,
//           })
//         }
//       })

//       set({ settings, sentNotifications, pendingNotifications })
//     } catch (error) {
//       console.error("Error initializing notifications:", error)
//     }
//   },

//   updateSettings: async (newSettings) => {
//     try {
//       await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings))
//       set({ settings: newSettings })
//     } catch (error) {
//       console.error("Error updating settings:", error)
//     }
//   },

//   scheduleNotificationsForBirthday: async (student) => {
//     const { settings } = get()

//     if (!settings.enableNotifications) {
//       return
//     }

//     try {
//       const birthDate = new Date(student.birthDate)
//       const now = new Date()

//       // Set birth date to current year
//       birthDate.setFullYear(now.getFullYear())

//       // If birthday has passed this year, set to next year
//       if (birthDate < now) {
//         birthDate.setFullYear(now.getFullYear() + 1)
//       }

//       const pendingNotifications = [...get().pendingNotifications]

//       // Schedule day before notification
//       if (settings.enableDayBeforeNotification) {
//         const dayBeforeDate = new Date(birthDate)
//         dayBeforeDate.setDate(dayBeforeDate.getDate() - 1)
//         dayBeforeDate.setHours(settings.dayBeforeTime.getHours(), settings.dayBeforeTime.getMinutes(), 0, 0)

//         if (dayBeforeDate > now) {
//           const message = `${student.name} has a birthday tomorrow! 🎂`

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: "Birthday Reminder",
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: dayBeforeDate,
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-before",
//             scheduledTime: dayBeforeDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Schedule day of notification
//       if (settings.enableDayOfNotification) {
//         const dayOfDate = new Date(birthDate)
//         dayOfDate.setHours(settings.dayOfTime.getHours(), settings.dayOfTime.getMinutes(), 0, 0)

//         if (dayOfDate > now) {
//           const message = settings.defaultMessage.replace("{name}", student.name)

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: `Happy Birthday ${student.name}! 🎉`,
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: dayOfDate,
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-of",
//             scheduledTime: dayOfDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Save pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling notifications:", error)
//     }
//   },

//   scheduleCustomNotification: async (student, message) => {
//     try {
//       const { settings } = get()

//       // Schedule for 5 seconds from now
//       const scheduledTime = new Date(Date.now() + 5000)

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: `Message for ${student.name}`,
//           body: message,
//           data: { student },
//           sound: settings.enableSound,
//           vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//         },
//         trigger: scheduledTime,
//       })

//       const notification: NotificationItem = {
//         id: uuidv4(),
//         studentName: student.name,
//         studentId: student.rollNumber,
//         message,
//         type: "custom",
//         scheduledTime: scheduledTime.toISOString(),
//         notificationId,
//       }

//       const pendingNotifications = [...get().pendingNotifications, notification]
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling custom notification:", error)
//     }
//   },

//   cancelNotification: async (id) => {
//     try {
//       const pendingNotifications = [...get().pendingNotifications]
//       const notificationIndex = pendingNotifications.findIndex((n) => n.id === id)

//       if (notificationIndex !== -1) {
//         const notification = pendingNotifications[notificationIndex]

//         if (notification.notificationId) {
//           await Notifications.cancelScheduledNotificationAsync(notification.notificationId)
//         }

//         pendingNotifications.splice(notificationIndex, 1)
//         await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//         set({ pendingNotifications })
//       }
//     } catch (error) {
//       console.error("Error canceling notification:", error)
//     }
//   },

//   rescheduleAllNotifications: async () => {
//     try {
//       // Cancel all existing notifications
//       await Notifications.cancelAllScheduledNotificationsAsync()

//       // Clear pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify([]))
//       set({ pendingNotifications: [] })

//       // Reschedule for all birthdays
//       const { birthdays } = useBirthdayStore.getState()

//       for (const student of birthdays) {
//         await get().scheduleNotificationsForBirthday(student)
//       }
//     } catch (error) {
//       console.error("Error rescheduling notifications:", error)
//     }
//   },
// }))



// import { create } from "zustand"
// import * as Notifications from "expo-notifications"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import type { Student } from "../types"
// import { useBirthdayStore } from "./birthdayStore"
// import { v4 as uuidv4 } from "uuid"

// interface NotificationSettings {
//   enableNotifications: boolean
//   enableDayBeforeNotification: boolean
//   enableDayOfNotification: boolean
//   enableSound: boolean
//   enableVibration: boolean
//   dayBeforeTime: Date
//   dayOfTime: Date
//   defaultMessage: string
// }

// interface NotificationItem {
//   id: string
//   studentName: string
//   studentId: string
//   message: string
//   type: "day-before" | "day-of" | "custom"
//   scheduledTime: string
//   sentTime?: string
//   notificationId?: string
// }

// interface NotificationState {
//   settings: NotificationSettings
//   sentNotifications: NotificationItem[]
//   pendingNotifications: NotificationItem[]

//   initializeNotifications: () => Promise<void>
//   updateSettings: (settings: NotificationSettings) => Promise<void>
//   scheduleNotificationsForBirthday: (student: Student) => Promise<void>
//   scheduleCustomNotification: (student: Student, message: string) => Promise<void>
//   cancelNotification: (id: string) => Promise<void>
//   rescheduleAllNotifications: () => Promise<void>
// }

// const DEFAULT_SETTINGS: NotificationSettings = {
//   enableNotifications: true,
//   enableDayBeforeNotification: true,
//   enableDayOfNotification: true,
//   enableSound: true,
//   enableVibration: true,
//   dayBeforeTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM
//   dayOfTime: new Date(new Date().setHours(6, 0, 0, 0)), // 6:00 AM
//   defaultMessage: "Happy Birthday {name}! 🎂 Wishing you a fantastic day filled with joy and celebration! 🎉",
// }

// export const useNotificationStore = create<NotificationState>((set, get) => ({
//   settings: DEFAULT_SETTINGS,
//   sentNotifications: [],
//   pendingNotifications: [],

//   initializeNotifications: async () => {
//     try {
//       // Request permissions
//       const { status } = await Notifications.requestPermissionsAsync()
//       if (status !== "granted") {
//         console.log("Notification permissions not granted")
//         return
//       }

//       // Load settings from storage
//       const storedSettings = await AsyncStorage.getItem("notificationSettings")
//       const settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS

//       // Convert date strings back to Date objects
//       if (typeof settings.dayBeforeTime === "string") {
//         settings.dayBeforeTime = new Date(settings.dayBeforeTime)
//       }
//       if (typeof settings.dayOfTime === "string") {
//         settings.dayOfTime = new Date(settings.dayOfTime)
//       }

//       // Load notification history
//       const storedSentNotifications = await AsyncStorage.getItem("sentNotifications")
//       const sentNotifications = storedSentNotifications ? JSON.parse(storedSentNotifications) : []

//       const storedPendingNotifications = await AsyncStorage.getItem("pendingNotifications")
//       const pendingNotifications = storedPendingNotifications ? JSON.parse(storedPendingNotifications) : []

//       // Set up notification handler
//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: settings.enableSound,
//           shouldSetBadge: true,
//         }),
//       })

//       // Listen for notifications
//       const subscription = Notifications.addNotificationReceivedListener((notification) => {
//         const notificationId = notification.request.identifier
//         const pendingNotification = pendingNotifications.find((n) => n.notificationId === notificationId)

//         if (pendingNotification) {
//           // Move from pending to sent
//           const updatedPendingNotifications = pendingNotifications.filter((n) => n.notificationId !== notificationId)

//           const updatedSentNotifications = [
//             ...sentNotifications,
//             {
//               ...pendingNotification,
//               sentTime: new Date().toISOString(),
//             },
//           ]

//           // Update storage
//           AsyncStorage.setItem("pendingNotifications", JSON.stringify(updatedPendingNotifications))
//           AsyncStorage.setItem("sentNotifications", JSON.stringify(updatedSentNotifications))

//           // Update state
//           set({
//             pendingNotifications: updatedPendingNotifications,
//             sentNotifications: updatedSentNotifications,
//           })
//         }
//       })

//       set({ settings, sentNotifications, pendingNotifications })

//       return () => subscription.remove()
//     } catch (error) {
//       console.error("Error initializing notifications:", error)
//     }
//   },

//   updateSettings: async (newSettings) => {
//     try {
//       await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings))
//       set({ settings: newSettings })
//     } catch (error) {
//       console.error("Error updating settings:", error)
//     }
//   },

//   scheduleNotificationsForBirthday: async (student) => {
//     const { settings } = get()

//     if (!settings.enableNotifications) {
//       return
//     }

//     try {
//       const birthDate = new Date(student.birthDate)
//       const now = new Date()

//       // Set birth date to current year
//       birthDate.setFullYear(now.getFullYear())

//       // If birthday has passed this year, set to next year
//       if (birthDate < now) {
//         birthDate.setFullYear(now.getFullYear() + 1)
//       }

//       const pendingNotifications = [...get().pendingNotifications]

//       // Schedule day before notification
//       if (settings.enableDayBeforeNotification) {
//         const dayBeforeDate = new Date(birthDate)
//         dayBeforeDate.setDate(dayBeforeDate.getDate() - 1)
//         dayBeforeDate.setHours(settings.dayBeforeTime.getHours(), settings.dayBeforeTime.getMinutes(), 0, 0)

//         if (dayBeforeDate > now) {
//           const message = `${student.name} has a birthday tomorrow! 🎂`

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: "Birthday Reminder",
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: dayBeforeDate,
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-before",
//             scheduledTime: dayBeforeDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Schedule day of notification
//       if (settings.enableDayOfNotification) {
//         const dayOfDate = new Date(birthDate)
//         dayOfDate.setHours(settings.dayOfTime.getHours(), settings.dayOfTime.getMinutes(), 0, 0)

//         if (dayOfDate > now) {
//           const message = settings.defaultMessage.replace("{name}", student.name)

//           const notificationId = await Notifications.scheduleNotificationAsync({
//             content: {
//               title: `Happy Birthday ${student.name}! 🎉`,
//               body: message,
//               data: { student },
//               sound: settings.enableSound,
//               vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//             },
//             trigger: dayOfDate,
//           })

//           const notification: NotificationItem = {
//             id: uuidv4(),
//             studentName: student.name,
//             studentId: student.rollNumber,
//             message,
//             type: "day-of",
//             scheduledTime: dayOfDate.toISOString(),
//             notificationId,
//           }

//           pendingNotifications.push(notification)
//         }
//       }

//       // Save pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling notifications:", error)
//     }
//   },

//   scheduleCustomNotification: async (student, message) => {
//     try {
//       const { settings } = get()

//       // Schedule for 5 seconds from now
//       const scheduledTime = new Date(Date.now() + 5000)

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: `Message for ${student.name}`,
//           body: message,
//           data: { student },
//           sound: settings.enableSound,
//           vibrate: settings.enableVibration ? [0, 250, 250, 250] : undefined,
//         },
//         trigger: scheduledTime,
//       })

//       const notification: NotificationItem = {
//         id: uuidv4(),
//         studentName: student.name,
//         studentId: student.rollNumber,
//         message,
//         type: "custom",
//         scheduledTime: scheduledTime.toISOString(),
//         notificationId,
//       }

//       const pendingNotifications = [...get().pendingNotifications, notification]
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//       set({ pendingNotifications })
//     } catch (error) {
//       console.error("Error scheduling custom notification:", error)
//     }
//   },

//   cancelNotification: async (id) => {
//     try {
//       const pendingNotifications = [...get().pendingNotifications]
//       const notificationIndex = pendingNotifications.findIndex((n) => n.id === id)

//       if (notificationIndex !== -1) {
//         const notification = pendingNotifications[notificationIndex]

//         if (notification.notificationId) {
//           await Notifications.cancelScheduledNotificationAsync(notification.notificationId)
//         }

//         pendingNotifications.splice(notificationIndex, 1)
//         await AsyncStorage.setItem("pendingNotifications", JSON.stringify(pendingNotifications))
//         set({ pendingNotifications })
//       }
//     } catch (error) {
//       console.error("Error canceling notification:", error)
//     }
//   },

//   rescheduleAllNotifications: async () => {
//     try {
//       // Cancel all existing notifications
//       await Notifications.cancelAllScheduledNotificationsAsync()

//       // Clear pending notifications
//       await AsyncStorage.setItem("pendingNotifications", JSON.stringify([]))
//       set({ pendingNotifications: [] })

//       // Reschedule for all birthdays
//       const { birthdays } = useBirthdayStore.getState()

//       for (const student of birthdays) {
//         await get().scheduleNotificationsForBirthday(student)
//       }
//     } catch (error) {
//       console.error("Error rescheduling notifications:", error)
//     }
//   },
// }))
