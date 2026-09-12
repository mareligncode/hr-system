import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const STATS: StatCardProps[] = [
  { icon: "people", label: "Total Employees", value: "248", color: "#6C63FF" },
  { icon: "checkmark-circle", label: "Present Today", value: "211", color: "#10B981" },
  { icon: "time", label: "On Leave", value: "18", color: "#F59E0B" },
  { icon: "wallet", label: "Payroll Due", value: "$84k", color: "#EF4444" },
];

interface QuickActionProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
}

function QuickAction({ icon, label, color }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.75}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const QUICK_ACTIONS: QuickActionProps[] = [
  { icon: "person-add", label: "Add Employee", color: "#6C63FF" },
  { icon: "calendar", label: "Mark Leave", color: "#10B981" },
  { icon: "document-text", label: "Run Payroll", color: "#F59E0B" },
  { icon: "bar-chart", label: "Reports", color: "#3B82F6" },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.headerTitle}>HR Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.75}>
            <Ionicons name="notifications-outline" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <QuickAction key={a.label} {...a} />
          ))}
        </View>

        {/* Placeholder Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.placeholderCard}>
          <Ionicons name="list-outline" size={32} color="#334155" />
          <Text style={styles.placeholderText}>Activity feed coming soon</Text>
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
    marginBottom: 24,
  },
  greeting: { fontSize: 13, color: "#94A3B8", marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#F1F5F9" },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#CBD5E1",
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#F1F5F9" },
  statLabel: { fontSize: 12, color: "#94A3B8" },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quickAction: { alignItems: "center", gap: 8, flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, color: "#94A3B8", textAlign: "center", fontWeight: "600" },
  placeholderCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  placeholderText: { color: "#475569", fontSize: 14 },
});
