"use client"

import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native"
import { useNotificationStore } from "../../store/notificationStore"
import { formatDate, formatTime } from "../../utils/dateUtils"
import { Stack } from "expo-router"
import { useState } from "react"

export default function NotificationsScreen() {
  const { sentNotifications, pendingNotifications, cancelNotification } = useNotificationStore()
  const [activeTab, setActiveTab] = useState("pending")

  const renderNotificationItem = ({ item }) => {
    const isPending = activeTab === "pending"

    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationType}>
            {item.type === "day-before" ? "🔔 Day Before" : item.type === "day-of" ? "🎂 Birthday" : "✉️ Custom"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isPending ? "#4dabf7" : "#82c91e" }]}>
            <Text style={styles.statusText}>{isPending ? "Scheduled" : "Sent"}</Text>
          </View>
        </View>

        <Text style={styles.recipientName}>{item.studentName}</Text>

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.notificationFooter}>
          {isPending ? (
            <>
              <Text style={styles.scheduledText}>
                Scheduled for: {formatDate(new Date(item.scheduledTime))} at {formatTime(new Date(item.scheduledTime))}
              </Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => cancelNotification(item.id)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.sentText}>
              Sent on: {formatDate(new Date(item.sentTime))} at {formatTime(new Date(item.sentTime))}
            </Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "Notifications" }} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
            Scheduled ({pendingNotifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>
            Sent ({sentNotifications.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === "pending" ? pendingNotifications : sentNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab === "pending" ? "scheduled" : "sent"} notifications</Text>
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e9ecef",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4dabf7",
  },
  tabText: {
    fontWeight: "500",
    color: "#495057",
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
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
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduledText: {
    fontSize: 12,
    color: "#6c757d",
  },
  sentText: {
    fontSize: 12,
    color: "#6c757d",
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
  },
})
