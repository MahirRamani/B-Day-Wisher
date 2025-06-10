import type React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import Colors from "../../constants/Colors"
import { useNotificationStore } from "../../store/notificationStore"

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"]
  color: string
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { pendingNotifications } = useNotificationStore()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Today's Birthdays",
          tabBarIcon: ({ color }) => <TabBarIcon name="birthday-cake" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Birthday",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          tabBarBadge: pendingNotifications.length > 0 ? pendingNotifications.length : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  )
}
