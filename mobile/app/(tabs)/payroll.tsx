import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface PayslipRow {
  id: string;
  month: string;
  gross: string;
  net: string;
  status: "paid" | "processing" | "pending";
}

const PAYSLIPS: PayslipRow[] = [
  { id: "1", month: "August 2026", gross: "$6,200", net: "$4,850", status: "paid" },
  { id: "2", month: "July 2026", gross: "$6,200", net: "$4,850", status: "paid" },
  { id: "3", month: "June 2026", gross: "$6,000", net: "$4,680", status: "paid" },
  { id: "4", month: "September 2026", gross: "$6,200", net: "$4,850", status: "processing" },
];

const STATUS_CONFIG = {
  paid: { color: "#10B981", bg: "#10B98122", label: "Paid" },
  processing: { color: "#6C63FF", bg: "#6C63FF22", label: "Processing" },
  pending: { color: "#F59E0B", bg: "#F59E0B22", label: "Pending" },
};

interface BreakdownItemProps { label: string; amount: string; positive?: boolean }

function BreakdownItem({ label, amount, positive = true }: BreakdownItemProps) {
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={[styles.breakdownAmount, { color: positive ? "#10B981" : "#EF4444" }]}>
        {positive ? "+" : "-"}{amount}
      </Text>
    </View>
  );
}

export default function PayrollScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payroll</Text>
          <TouchableOpacity style={styles.exportBtn} activeOpacity={0.75}>
            <Ionicons name="download-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* This Month Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroMonth}>September 2026</Text>
          <Text style={styles.heroLabel}>Expected Net Salary</Text>
          <Text style={styles.heroAmount}>$4,850.00</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroSub}>Gross: $6,200  ·  Deductions: $1,350</Text>
          </View>
          <View style={[styles.heroStatusBadge, { backgroundColor: "#6C63FF22" }]}>
            <Text style={[styles.heroStatusText, { color: "#6C63FF" }]}>⏳ Processing</Text>
          </View>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        <View style={styles.breakdownCard}>
          <BreakdownItem label="Base Salary" amount="$5,000" positive />
          <BreakdownItem label="Housing Allowance" amount="$800" positive />
          <BreakdownItem label="Transport" amount="$200" positive />
          <BreakdownItem label="Performance Bonus" amount="$200" positive />
          <View style={styles.divider} />
          <BreakdownItem label="Tax (PAYE)" amount="$920" positive={false} />
          <BreakdownItem label="Pension (5%)" amount="$300" positive={false} />
          <BreakdownItem label="Health Insurance" amount="$130" positive={false} />
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>Payslip History</Text>
        <View style={styles.historyList}>
          {PAYSLIPS.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <TouchableOpacity key={p.id} style={styles.historyCard} activeOpacity={0.75}>
                <View style={styles.historyLeft}>
                  <Ionicons name="document-text-outline" size={22} color="#6C63FF" />
                  <View>
                    <Text style={styles.historyMonth}>{p.month}</Text>
                    <Text style={styles.historyGross}>Gross: {p.gross}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyNet}>{p.net}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 4,
  },
  heroMonth: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  heroLabel: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
  heroAmount: { fontSize: 36, fontWeight: "800", color: "#F1F5F9", marginTop: 4 },
  heroRow: { marginTop: 2 },
  heroSub: { fontSize: 12, color: "#64748B" },
  heroStatusBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  heroStatusText: { fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#CBD5E1", marginBottom: 12, marginTop: 8 },
  breakdownCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, gap: 2, marginBottom: 8 },
  breakdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  breakdownLabel: { fontSize: 14, color: "#94A3B8" },
  breakdownAmount: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 4 },
  historyList: { gap: 10 },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
  },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyMonth: { fontSize: 14, fontWeight: "600", color: "#F1F5F9" },
  historyGross: { fontSize: 12, color: "#64748B", marginTop: 2 },
  historyRight: { alignItems: "flex-end", gap: 4 },
  historyNet: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
