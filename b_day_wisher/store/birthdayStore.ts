import { create } from "zustand"
import { fetchFromGoogleSheets, addToGoogleSheets } from "../lib/googleSheetsApi"
import type { Student } from "../types"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface BirthdayState {
  birthdays: Student[]
  todayBirthdays: Student[]
  tomorrowBirthdays: Student[]
  loading: boolean
  error: string | null
  lastFetchTime: string | null

  fetchBirthdays: () => Promise<void>
  fetchTodayTomorrowBirthdays: () => Promise<void>
  addBirthday: (student: Omit<Student, "id">) => Promise<void>
  clearCache: () => Promise<void>
}

export const useBirthdayStore = create<BirthdayState>((set, get) => ({
  birthdays: [],
  todayBirthdays: [],
  tomorrowBirthdays: [],
  loading: false,
  error: null,
  lastFetchTime: null,

  clearCache: async () => {
    try {
      await AsyncStorage.removeItem("allBirthdays")
      await AsyncStorage.removeItem("todayTomorrowBirthdays")
      console.log("Cache cleared successfully")
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  },

  fetchBirthdays: async () => {
    console.log("Starting fetchBirthdays...")
    set({ loading: true, error: null })

    try {
      // Always fetch fresh data for now (to avoid cache issues)
      console.log("Fetching fresh data from Google Sheets...")
      const birthdays = await fetchFromGoogleSheets()
      const timestamp = new Date().toISOString()

      console.log("Fetched birthdays:", birthdays.length, "records")
      birthdays.forEach((birthday, index) => {
        console.log(`${index + 1}. ${birthday.name} - ${new Date(birthday.birthDate).toDateString()}`)
      })

      // Save to cache
      await AsyncStorage.setItem(
        "allBirthdays",
        JSON.stringify({
          birthdays,
          timestamp,
        }),
      )

      set({ birthdays, loading: false, lastFetchTime: timestamp })
      console.log("Successfully set birthdays in store")
    } catch (error) {
      console.error("Error fetching birthdays:", error)
      set({ loading: false, error: "Failed to fetch birthdays" })
    }
  },

  fetchTodayTomorrowBirthdays: async () => {
    console.log("Starting fetchTodayTomorrowBirthdays...")
    set({ loading: true, error: null })

    try {
      // Get current birthdays from store
      let { birthdays } = get()

      // If no birthdays in store, fetch them first
      if (birthdays.length === 0) {
        console.log("No birthdays in store, fetching first...")
        await get().fetchBirthdays()
        birthdays = get().birthdays
      }

      console.log("Working with", birthdays.length, "birthdays")

      const now = new Date()
      const today = {
        day: now.getDate(),
        month: now.getMonth(),
      }

      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDate = {
        day: tomorrow.getDate(),
        month: tomorrow.getMonth(),
      }

      console.log("Today:", today.day, "/", today.month + 1)
      console.log("Tomorrow:", tomorrowDate.day, "/", tomorrowDate.month + 1)

      // Filter for today's birthdays
      const todayBirthdays = birthdays.filter((student) => {
        const birthDate = new Date(student.birthDate)
        const studentBirthDay = birthDate.getDate()
        const studentBirthMonth = birthDate.getMonth()

        const isToday = studentBirthDay === today.day && studentBirthMonth === today.month

        console.log(`${student.name}: ${studentBirthDay}/${studentBirthMonth + 1} - Today: ${isToday}`)

        return isToday
      })

      // Filter for tomorrow's birthdays
      const tomorrowBirthdays = birthdays.filter((student) => {
        const birthDate = new Date(student.birthDate)
        const studentBirthDay = birthDate.getDate()
        const studentBirthMonth = birthDate.getMonth()

        const isTomorrow = studentBirthDay === tomorrowDate.day && studentBirthMonth === tomorrowDate.month

        console.log(`${student.name}: ${studentBirthDay}/${studentBirthMonth + 1} - Tomorrow: ${isTomorrow}`)

        return isTomorrow
      })

      console.log("Today's birthdays found:", todayBirthdays.length)
      todayBirthdays.forEach((student) => console.log("- Today:", student.name))

      console.log("Tomorrow's birthdays found:", tomorrowBirthdays.length)
      tomorrowBirthdays.forEach((student) => console.log("- Tomorrow:", student.name))

      // Save to cache
      const cacheDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      await AsyncStorage.setItem(
        "todayTomorrowBirthdays",
        JSON.stringify({
          todayBirthdays,
          tomorrowBirthdays,
          cacheDate,
        }),
      )

      set({
        todayBirthdays,
        tomorrowBirthdays,
        loading: false,
      })

      console.log("Successfully updated today/tomorrow birthdays in store")
    } catch (error) {
      console.error("Error fetching today/tomorrow birthdays:", error)
      set({ loading: false, error: "Failed to fetch today/tomorrow birthdays" })
    }
  },

  addBirthday: async (student) => {
    set({ loading: true, error: null })

    try {
      // Add to Google Sheets
      await addToGoogleSheets(student)

      // Update local state
      const newStudent = {
        ...student,
        rollNumber: student.rollNumber,
      }

      set((state) => ({
        birthdays: [...state.birthdays, newStudent],
        loading: false,
      }))

      // Refresh today/tomorrow birthdays
      await get().fetchTodayTomorrowBirthdays()

      // Update cache
      const cachedData = await AsyncStorage.getItem("allBirthdays")
      if (cachedData) {
        const { birthdays, timestamp } = JSON.parse(cachedData)
        await AsyncStorage.setItem(
          "allBirthdays",
          JSON.stringify({
            birthdays: [...birthdays, newStudent],
            timestamp: new Date().toISOString(),
          }),
        )
      }
    } catch (error) {
      console.error("Error adding birthday:", error)
      set({ loading: false, error: "Failed to add birthday" })
    }
  },
}))



// import { create } from "zustand"
// import { fetchFromGoogleSheets, addToGoogleSheets } from "../lib/googleSheetsApi"
// import type { Student } from "../types"
// import AsyncStorage from "@react-native-async-storage/async-storage"

// interface BirthdayState {
//   birthdays: Student[]
//   todayBirthdays: Student[]
//   tomorrowBirthdays: Student[]
//   loading: boolean
//   error: string | null
//   lastFetchTime: string | null

//   fetchBirthdays: () => Promise<void>
//   fetchTodayTomorrowBirthdays: () => Promise<void>
//   addBirthday: (student: Omit<Student, "id">) => Promise<void>
// }

// export const useBirthdayStore = create<BirthdayState>((set, get) => ({
//   birthdays: [],
//   todayBirthdays: [],
//   tomorrowBirthdays: [],
//   loading: false,
//   error: null,
//   lastFetchTime: null,

//   fetchBirthdays: async () => {
//     set({ loading: true, error: null })

//     try {
//       // Try to get from cache first
//       // const cachedData = await AsyncStorage.getItem("allBirthdays")

//       // if (cachedData) {
//       //   const { birthdays, timestamp } = JSON.parse(cachedData)
//       //   const cacheTime = new Date(timestamp)
//       //   const now = new Date()

//       //   // Use cache if it's less than 1 hour old
//       //   if (now.getTime() - cacheTime.getTime() < 3600000) {
//       //     set({ birthdays, loading: false, lastFetchTime: timestamp })
//       //     return
//       //   }
//       // }

//       // Fetch from API if cache is old or doesn't exist
//       const birthdays = await fetchFromGoogleSheets()
//       const timestamp = new Date().toISOString()

//       // Save to cache
//       await AsyncStorage.setItem(
//         "allBirthdays",
//         JSON.stringify({
//           birthdays,
//           timestamp,
//         }),
//       )

//       set({ birthdays, loading: false, lastFetchTime: timestamp })
//     } catch (error) {
//       console.error("Error fetching birthdays:", error)
//       set({ loading: false, error: "Failed to fetch birthdays" })
//     }
//   },

//   fetchTodayTomorrowBirthdays: async () => {
//     set({ loading: true, error: null })

//     try {
//       // Check if we need to refresh the cache
//       const cachedData = await AsyncStorage.getItem("todayTomorrowBirthdays")
//       const now = new Date()
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

//       if (cachedData) {
//         const { todayBirthdays, tomorrowBirthdays, cacheDate } = JSON.parse(cachedData)

//         // If cache is from today, use it
//         if (cacheDate === today) {
//           set({ todayBirthdays, tomorrowBirthdays, loading: false })
//           return
//         }
//       }

//       // If we need to refresh or no cache exists
//       let birthdays = get().birthdays
//       if (birthdays.length === 0) {
//         birthdays = await fetchFromGoogleSheets()
//         set({ birthdays })
//       }

//       console.log("All birthdays:", birthdays)
//       console.log("Current date:", now)

//       // Filter for today's birthdays
//       const todayBirthdays = birthdays.filter((student) => {
//         const birthDate = new Date(student.birthDate)
//         const isToday = birthDate.getDate() === now.getDate() && birthDate.getMonth() === now.getMonth()
//         console.log(`${student.name}: Birth date ${birthDate.toDateString()}, Today: ${isToday}`)
//         return isToday
//       })

//       // Filter for tomorrow's birthdays
//       const tomorrow = new Date(now)
//       tomorrow.setDate(tomorrow.getDate() + 1)

//       const tomorrowBirthdays = birthdays.filter((student) => {
//         const birthDate = new Date(student.birthDate)
//         const isTomorrow = birthDate.getDate() === tomorrow.getDate() && birthDate.getMonth() === tomorrow.getMonth()
//         console.log(`${student.name}: Birth date ${birthDate.toDateString()}, Tomorrow: ${isTomorrow}`)
//         return isTomorrow
//       })

//       console.log("Today's birthdays:", todayBirthdays)
//       console.log("Tomorrow's birthdays:", tomorrowBirthdays)

//       // Save to cache
//       await AsyncStorage.setItem(
//         "todayTomorrowBirthdays",
//         JSON.stringify({
//           todayBirthdays,
//           tomorrowBirthdays,
//           cacheDate: today,
//         }),
//       )

//       set({
//         todayBirthdays,
//         tomorrowBirthdays,
//         loading: false,
//       })
//     } catch (error) {
//       console.error("Error fetching today/tomorrow birthdays:", error)
//       set({ loading: false, error: "Failed to fetch today/tomorrow birthdays" })
//     }
//   },

//   addBirthday: async (student) => {
//     set({ loading: true, error: null })

//     try {
//       // Add to Google Sheets
//       await addToGoogleSheets(student)

//       // Update local state
//       const newStudent = {
//         ...student,
//         rollNumber: student.rollNumber,
//       }

//       set((state) => ({
//         birthdays: [...state.birthdays, newStudent],
//         loading: false,
//       }))

//       // Refresh today/tomorrow birthdays
//       get().fetchTodayTomorrowBirthdays()

//       // Update cache
//       const cachedData = await AsyncStorage.getItem("allBirthdays")
//       if (cachedData) {
//         const { birthdays, timestamp } = JSON.parse(cachedData)
//         await AsyncStorage.setItem(
//           "allBirthdays",
//           JSON.stringify({
//             birthdays: [...birthdays, newStudent],
//             timestamp: new Date().toISOString(),
//           }),
//         )
//       }
//     } catch (error) {
//       console.error("Error adding birthday:", error)
//       set({ loading: false, error: "Failed to add birthday" })
//     }
//   },
// }))




// // import { create } from "zustand"
// // import { fetchFromGoogleSheets, addToGoogleSheets } from "../lib/googleSheetsApi"
// // import type { Student } from "../types"
// // import AsyncStorage from "@react-native-async-storage/async-storage"

// // interface BirthdayState {
// //   birthdays: Student[]
// //   todayBirthdays: Student[]
// //   tomorrowBirthdays: Student[]
// //   loading: boolean
// //   error: string | null
// //   lastFetchTime: string | null

// //   fetchBirthdays: () => Promise<void>
// //   fetchTodayTomorrowBirthdays: () => Promise<void>
// //   addBirthday: (student: Omit<Student, "id">) => Promise<void>
// // }

// // export const useBirthdayStore = create<BirthdayState>((set, get) => ({
// //   birthdays: [],
// //   todayBirthdays: [],
// //   tomorrowBirthdays: [],
// //   loading: false,
// //   error: null,
// //   lastFetchTime: null,

// //   fetchBirthdays: async () => {
// //     set({ loading: true, error: null })

// //     try {
// //       // Try to get from cache first
// //       const cachedData = await AsyncStorage.getItem("allBirthdays")

// //       if (cachedData) {
// //         const { birthdays, timestamp } = JSON.parse(cachedData)
// //         const cacheTime = new Date(timestamp)
// //         const now = new Date()

// //         // Use cache if it's less than 1 hour old
// //         if (now.getTime() - cacheTime.getTime() < 3600000) {
// //           set({ birthdays, loading: false, lastFetchTime: timestamp })
// //           return
// //         }
// //       }

// //       // Fetch from API if cache is old or doesn't exist
// //       const birthdays = await fetchFromGoogleSheets()
// //       const timestamp = new Date().toISOString()

// //       // Save to cache
// //       await AsyncStorage.setItem(
// //         "allBirthdays",
// //         JSON.stringify({
// //           birthdays,
// //           timestamp,
// //         }),
// //       )

// //       set({ birthdays, loading: false, lastFetchTime: timestamp })
// //     } catch (error) {
// //       console.error("Error fetching birthdays:", error)
// //       set({ loading: false, error: "Failed to fetch birthdays" })
// //     }
// //   },

// //   fetchTodayTomorrowBirthdays: async () => {
// //     set({ loading: true, error: null })

// //     try {
// //       // Check if we need to refresh the cache
// //       const cachedData = await AsyncStorage.getItem("todayTomorrowBirthdays")
// //       const now = new Date()
// //       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

// //       if (cachedData) {
// //         const { todayBirthdays, tomorrowBirthdays, cacheDate } = JSON.parse(cachedData)

// //         // If cache is from today, use it
// //         if (cacheDate === today) {
// //           set({ todayBirthdays, tomorrowBirthdays, loading: false })
// //           return
// //         }
// //       }

// //       // If we need to refresh or no cache exists
// //       const birthdays = get().birthdays.length > 0 ? get().birthdays : await fetchFromGoogleSheets()

// //       // Filter for today's birthdays
// //       const todayBirthdays = birthdays.filter((student) => {
// //         const birthDate = new Date(student.birthDate)
// //         return birthDate.getDate() === now.getDate() && birthDate.getMonth() === now.getMonth()
// //       })

// //       // Filter for tomorrow's birthdays
// //       const tomorrow = new Date(now)
// //       tomorrow.setDate(tomorrow.getDate() + 1)

// //       const tomorrowBirthdays = birthdays.filter((student) => {
// //         const birthDate = new Date(student.birthDate)
// //         return birthDate.getDate() === tomorrow.getDate() && birthDate.getMonth() === tomorrow.getMonth()
// //       })

// //       // Save to cache
// //       await AsyncStorage.setItem(
// //         "todayTomorrowBirthdays",
// //         JSON.stringify({
// //           todayBirthdays,
// //           tomorrowBirthdays,
// //           cacheDate: today,
// //         }),
// //       )

// //       set({
// //         todayBirthdays,
// //         tomorrowBirthdays,
// //         loading: false,
// //         birthdays: birthdays.length > 0 ? birthdays : get().birthdays,
// //       })
// //     } catch (error) {
// //       console.error("Error fetching today/tomorrow birthdays:", error)
// //       set({ loading: false, error: "Failed to fetch today/tomorrow birthdays" })
// //     }
// //   },

// //   addBirthday: async (student) => {
// //     set({ loading: true, error: null })

// //     try {
// //       // Add to Google Sheets
// //       await addToGoogleSheets(student)

// //       // Update local state
// //       const newStudent = {
// //         ...student,
// //         rollNumber: student.rollNumber,
// //       }

// //       set((state) => ({
// //         birthdays: [...state.birthdays, newStudent],
// //         loading: false,
// //       }))

// //       // Refresh today/tomorrow birthdays
// //       get().fetchTodayTomorrowBirthdays()

// //       // Update cache
// //       const cachedData = await AsyncStorage.getItem("allBirthdays")
// //       if (cachedData) {
// //         const { birthdays, timestamp } = JSON.parse(cachedData)
// //         await AsyncStorage.setItem(
// //           "allBirthdays",
// //           JSON.stringify({
// //             birthdays: [...birthdays, newStudent],
// //             timestamp: new Date().toISOString(),
// //           }),
// //         )
// //       }
// //     } catch (error) {
// //       console.error("Error adding birthday:", error)
// //       set({ loading: false, error: "Failed to add birthday" })
// //     }
// //   },
// // }))
