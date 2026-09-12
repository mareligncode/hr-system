import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface LeaveRequest {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: "approved" | "pending" | "rejected";
  reason: string;
}

const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "1", type: "Annual Leave", from: "Sep 15", to: "Sep 18", days: 4, status: "approved", reason: "Family vacation" },
  { id: "2", type: "Sick Leave", from: "Sep 10", to: "Sep 10", days: 1, status: "approved", reason: "Fever" },
  { id: "3", type: "Personal Leave", from: "Sep 25", to: "Sep 26", days: 2, status: "pending", reason: "Personal matters" },
  { id: "4", type: "Annual Leave", from: "Oct 02", to: "Oct 06", days: 5, status: "rejected", reason: "Project deadline" },
];

const STATUS_CONFIG = {
  approved: { color: "#10B981", bg: "#10B98122", label: "Approved", icon: "checkmark-circle" as const },
  pending: { color: "#F59E0B", bg: "#F59E0B22", label: "Pending", icon: "time" as const },
  rejected: { color: "#EF4444", bg: "#EF444422", label: "Rejected", icon: "close-circle" as const },
};

interface BalanceCardProps { label: string; used: number; total: number; color: string }

function BalanceCard({ label, used, total, color }: BalanceCardProps) {
  const pct = (used / total) * 100;
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTop}>
        <Text style={styles.balanceLabel}>{label}</Text>
        <Text style={[styles.balanceDays, { color }]}>{total - used} left</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.balanceSub}>{used}/{total} days used</Text>
    </View>
  );
}

export default function LeaveScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leave</Text>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.75}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.balanceGrid}>
          <BalanceCard label="Annual Leave" used={6} total={20} color="#6C63FF" />
          <BalanceCard label="Sick Leave" used={1} total={10} color="#EF4444" />
          <BalanceCard label="Personal" used={2} total={5} color="#F59E0B" />
          <BalanceCard label="Maternity" used={0} total={90} color="#10B981" />
        </View>

        {/* Requests */}
        <Text style={styles.sectionTitle}>My Requests</Text>
        <View style={styles.requestsList}>
          {LEAVE_REQUESTS.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Text style={styles.requestType}>{req.type}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.requestDates}>
                  {req.from} – {req.to}  ·  {req.days} day{req.days > 1 ? "s" : ""}
                </Text>
                <Text style={styles.requestReason}>{req.reason}</Text>
              </View>
            );
          })}
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
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  applyBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#CBD5E1", marginBottom: 12, marginTop: 8 },
  balanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  balanceCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  balanceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  balanceDays: { fontSize: 14, fontWeight: "700" },
  progressBg: { height: 4, backgroundColor: "#334155", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  balanceSub: { fontSize: 10, color: "#64748B" },
  requestsList: { gap: 10 },
  requestCard: { backgroundColor: "#1E293B", borderRadius: 14, padding: 16, gap: 6 },
  requestTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  requestType: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  requestDates: { fontSize: 12, color: "#94A3B8" },
  requestReason: { fontSize: 12, color: "#64748B", fontStyle: "italic" },
});
