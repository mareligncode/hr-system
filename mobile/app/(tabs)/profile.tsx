import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  subtitle?: string;
  color?: string;
  danger?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItemProps[] }[] = [
  {
    title: "Account",
    items: [
      { icon: "person-outline", label: "Personal Information", subtitle: "Update your details" },
      { icon: "lock-closed-outline", label: "Change Password", subtitle: "Security settings" },
      { icon: "notifications-outline", label: "Notifications", subtitle: "Manage alerts" },
    ],
  },
  {
    title: "HR",
    items: [
      { icon: "document-text-outline", label: "My Documents", subtitle: "Contracts, certificates" },
      { icon: "briefcase-outline", label: "Job Information", subtitle: "Role, department, grade" },
      { icon: "people-outline", label: "My Team", subtitle: "Colleagues & manager" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help & FAQ", subtitle: "Get assistance" },
      { icon: "chatbubble-outline", label: "Contact HR", subtitle: "Raise a ticket" },
    ],
  },
  {
    title: "",
    items: [
      { icon: "log-out-outline", label: "Sign Out", color: "#EF4444", danger: true },
    ],
  },
];

function MenuItem({ icon, label, subtitle, color, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: (color ?? "#6C63FF") + "22" }]}>
        <Ionicons name={icon} size={20} color={color ?? "#6C63FF"} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, danger && { color: "#EF4444" }]}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#475569" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Avatar & info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
          </View>
          <Text style={styles.profileName}>Alice Johnson</Text>
          <Text style={styles.profileRole}>Software Engineer  ·  Engineering</Text>
          <Text style={styles.profileId}>EMP-00142</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>🟢  Active</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Days Present", value: "211" },
            { label: "Leaves Left", value: "14" },
            { label: "Yrs at Co.", value: "3.5" },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
            <View style={styles.menuCard}>
              {section.items.map((item, ii) => (
                <View key={ii}>
                  <MenuItem {...item} />
                  {ii < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scroll: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#F1F5F9", marginBottom: 20 },
  profileCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#6C63FF33",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#6C63FF" },
  profileName: { fontSize: 20, fontWeight: "700", color: "#F1F5F9" },
  profileRole: { fontSize: 13, color: "#94A3B8" },
  profileId: { fontSize: 11, color: "#64748B" },
  profileBadge: {
    backgroundColor: "#10B98122",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  profileBadgeText: { fontSize: 12, color: "#10B981", fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-around",
  },
  statBox: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#F1F5F9" },
  statLabel: { fontSize: 11, color: "#94A3B8", textAlign: "center" },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748B", marginBottom: 8, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.6 },
  menuCard: { backgroundColor: "#1E293B", borderRadius: 16, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#F1F5F9" },
  menuSub: { fontSize: 12, color: "#64748B", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#0F172A", marginLeft: 64 },
});
