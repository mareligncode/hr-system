import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Dashboard",
    icon: "grid-outline",
    iconFocused: "grid",
  },
  {
    name: "employees",
    title: "Employees",
    icon: "people-outline",
    iconFocused: "people",
  },
  {
    name: "attendance",
    title: "Attendance",
    icon: "time-outline",
    iconFocused: "time",
  },
  {
    name: "leave",
    title: "Leave",
    icon: "calendar-outline",
    iconFocused: "calendar",
  },
  {
    name: "payroll",
    title: "Payroll",
    icon: "wallet-outline",
    iconFocused: "wallet",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    iconFocused: "person",
  },
];

const ACTIVE_COLOR = "#6C63FF";
const INACTIVE_COLOR = "#94A3B8";
const TAB_BG = "#0F172A";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: "#1E293B",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
