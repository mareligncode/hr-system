import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ATTENDANCE_DATA: Record<string, "present" | "absent" | "half" | "off"> = {
  Mon: "present",
  Tue: "present",
  Wed: "half",
  Thu: "present",
  Fri: "absent",
  Sat: "off",
  Sun: "off",
};

const STATUS_CONFIG = {
  present: { color: "#10B981", label: "Present", icon: "checkmark-circle" as const },
  absent: { color: "#EF4444", label: "Absent", icon: "close-circle" as const },
  half: { color: "#F59E0B", label: "Half Day", icon: "remove-circle" as const },
  off: { color: "#475569", label: "Day Off", icon: "moon" as const },
};

interface AttendanceRowProps {
  name: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: "present" | "late" | "absent";
}

const RECENT: AttendanceRowProps[] = [
  { name: "Alice Johnson", checkIn: "08:52", checkOut: "17:10", hours: "8h 18m", status: "present" },
  { name: "Bob Smith", checkIn: "09:15", checkOut: "17:45", hours: "8h 30m", status: "late" },
  { name: "Carol White", checkIn: "--", checkOut: "--", hours: "0h", status: "absent" },
  { name: "David Lee", checkIn: "08:30", checkOut: "13:00", hours: "4h 30m", status: "present" },
];

const ROW_STATUS_COLOR = { present: "#10B981", late: "#F59E0B", absent: "#EF4444" };

export default function AttendanceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
            <Ionicons name="filter-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* My Week */}
        <Text style={styles.sectionTitle}>My Week</Text>
        <View style={styles.weekRow}>
          {DAYS.map((day) => {
            const status = ATTENDANCE_DATA[day];
            const cfg = STATUS_CONFIG[status];
            return (
              <View key={day} style={styles.dayCell}>
                <Text style={styles.dayLabel}>{day}</Text>
                <Ionicons name={cfg.icon} size={26} color={cfg.color} />
                <Text style={[styles.dayStatus, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Today's Summary */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          {[
            { label: "Present", value: "211", color: "#10B981" },
            { label: "Absent", value: "18", color: "#EF4444" },
            { label: "Late", value: "9", color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Attendance */}
        <Text style={styles.sectionTitle}>Recent Records</Text>
        <View style={styles.recordsList}>
          {RECENT.map((r) => (
            <View key={r.name} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordName}>{r.name}</Text>
                <Text style={styles.recordTimes}>
                  {r.checkIn} → {r.checkOut}
                </Text>
              </View>
              <View style={styles.recordRight}>
                <Text style={styles.recordHours}>{r.hours}</Text>
                <View style={[styles.recordBadge, { backgroundColor: ROW_STATUS_COLOR[r.status] + "22" }]}>
                  <Text style={[styles.recordBadgeText, { color: ROW_STATUS_COLOR[r.status] }]}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scroll: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#F1F5F9" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#CBD5E1", marginBottom: 12, marginTop: 8 },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  dayCell: { alignItems: "center", gap: 4, flex: 1 },
  dayLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  dayStatus: { fontSize: 9, fontWeight: "600" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: { fontSize: 26, fontWeight: "700" },
  summaryLabel: { fontSize: 12, color: "#94A3B8" },
  recordsList: { gap: 10 },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
  },
  recordLeft: { gap: 3 },
  recordName: { fontSize: 14, fontWeight: "600", color: "#F1F5F9" },
  recordTimes: { fontSize: 12, color: "#94A3B8" },
  recordRight: { alignItems: "flex-end", gap: 4 },
  recordHours: { fontSize: 14, fontWeight: "700", color: "#CBD5E1" },
  recordBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  recordBadgeText: { fontSize: 11, fontWeight: "600" },
});
