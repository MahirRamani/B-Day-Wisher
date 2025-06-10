import type { Student } from "../types"

// This is a mock implementation of the Google Sheets API
// In a real app, you would use the Google Sheets API or a custom backend

// Get current date for testing
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

const nextWeek = new Date(today)
nextWeek.setDate(nextWeek.getDate() + 7)

// Sample data for testing with actual today/tomorrow birthdays
const SAMPLE_DATA: Student[] = [
  {
    rollNumber: "101",
    name: "John Doe",
    birthDate: new Date(2000, today.getMonth(), today.getDate()).toISOString(), // Today's birthday
    countryCode: "+91",
    mobileNumber: "8160264792",
    fieldOfStudy: "Computer Science",
    branch: "Software Engineering",
  },
  {
    rollNumber: "102",
    name: "Jane Smith",
    birthDate: new Date(1999, tomorrow.getMonth(), tomorrow.getDate()).toISOString(), // Tomorrow's birthday
    countryCode: "+91",
    mobileNumber: "9510560138",
    fieldOfStudy: "Information Technology",
    branch: "Data Science",
  },
  {
    rollNumber: "103",
    name: "Michael Johnson",
    birthDate: new Date(2001, today.getMonth(), today.getDate()).toISOString(), // Today's birthday
    countryCode: "+91",
    mobileNumber: "5551234567",
    fieldOfStudy: "Electrical Engineering",
    branch: "Electronics",
  },
  {
    rollNumber: "104",
    name: "Emily Williams",
    birthDate: new Date(2000, yesterday.getMonth(), yesterday.getDate()).toISOString(), // Yesterday's birthday
    countryCode: "+91",
    mobileNumber: "7778889999",
    fieldOfStudy: "Mechanical Engineering",
    branch: "Robotics",
  },
  {
    rollNumber: "105",
    name: "David Brown",
    birthDate: new Date(1998, nextWeek.getMonth(), nextWeek.getDate()).toISOString(), // Next week's birthday
    countryCode: "+91",
    mobileNumber: "3334445555",
    fieldOfStudy: "Civil Engineering",
    branch: "Structural Engineering",
  },
  {
    rollNumber: "106",
    name: "Sarah Wilson",
    birthDate: new Date(2002, tomorrow.getMonth(), tomorrow.getDate()).toISOString(), // Tomorrow's birthday
    countryCode: "+91",
    mobileNumber: "1112223333",
    fieldOfStudy: "Computer Science",
    branch: "Artificial Intelligence",
  },
]

// In a real app, this would fetch data from Google Sheets using Google Apps Script
export const fetchFromGoogleSheets = async (): Promise<Student[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return sample data
  return SAMPLE_DATA
}

// In a real app, this would add data to Google Sheets using Google Apps Script
export const addToGoogleSheets = async (student: Omit<Student, "id">): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would add the data to Google Sheets
  console.log("Adding student to Google Sheets:", student)

  // Add to sample data (for testing)
  SAMPLE_DATA.push({
    ...student,
    rollNumber: student.rollNumber,
  })
}
