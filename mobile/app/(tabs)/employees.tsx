import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "on-leave" | "remote";
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Alice Johnson", role: "Software Engineer", department: "Engineering", status: "active" },
  { id: "2", name: "Bob Smith", role: "HR Manager", department: "Human Resources", status: "active" },
  { id: "3", name: "Carol White", role: "Product Designer", department: "Design", status: "remote" },
  { id: "4", name: "David Lee", role: "Data Analyst", department: "Analytics", status: "on-leave" },
  { id: "5", name: "Eva Martinez", role: "Marketing Lead", department: "Marketing", status: "active" },
  { id: "6", name: "Frank Chen", role: "DevOps Engineer", department: "Engineering", status: "remote" },
];

const STATUS_COLOR: Record<Employee["status"], string> = {
  active: "#10B981",
  "on-leave": "#F59E0B",
  remote: "#6C63FF",
};

const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "Active",
  "on-leave": "On Leave",
  remote: "Remote",
};

function EmployeeCard({ item }: { item: Employee }) {
  const initials = item.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardRole}>{item.role}</Text>
        <Text style={styles.cardDept}>{item.department}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
        <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EmployeesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employees</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.75}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor="#64748B"
        />
      </View>

      {/* List */}
      <FlatList
        data={MOCK_EMPLOYEES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmployeeCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#F1F5F9" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#F1F5F9", fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6C63FF33",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#6C63FF" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#F1F5F9" },
  cardRole: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  cardDept: { fontSize: 11, color: "#64748B", marginTop: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
});
