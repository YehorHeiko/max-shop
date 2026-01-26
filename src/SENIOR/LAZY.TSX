import React, { lazy, Suspense, useState, useCallback, useContext, createContext } from "react";

// --- Types (Строгие типы) ---
type TabType = "first" | "second" | "third";

interface TabConfig {
  key: TabType;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

// --- Constants & Config ---
const TABS: TabConfig[] = [
  {
    key: "first",
    label: "Heavy Component",
    component: lazy(() => import("./components/HeavyComponent")),
  },
  {
    key: "second",
    label: "Todo Item",
    component: lazy(() => import("./components/TodoItem")),
  },
  {
    key: "third",
    label: "Reports",
    component: lazy(() => import("./components/Reports")),
  },
];

// --- Context для состояния вкладок (готов к глобальному использованию) ---
interface TabsContextType {
  activeTab: TabType | "";
  setActiveTab: (tab: TabType) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// Provider
const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType | "">("");

  const handleSetActiveTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // Preload компонента при выборе (оптимизация UX)
    const config = TABS.find((t) => t.key === tab);
    if (config) {
      config.component._init?.(); // Для React 18+ preload
    }
  }, []);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

// --- Custom Hook ---
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("useTabs must be used within TabsProvider");
  return context;
};

// --- Components ---
const TabContent: React.FC = () => {
  const { activeTab } = useTabs();

  const renderContent = useCallback(() => {
    const config = TABS.find((tab) => tab.key === activeTab);
    if (!config) return <p>Select a tab to load content.</p>;

    const Component = config.component;
    return <Component />;
  }, [activeTab]);

  return (
    <Suspense fallback={<div aria-live="polite">Loading...</div>}>
      {renderContent()}
    </Suspense>
  );
};

// Error Boundary для lazy-ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Tab loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Failed to load tab. Please try again.</div>;
    }
    return this.props.children;
  }
}

// --- Main Component ---
const App: React.FC = () => {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div>
      <nav aria-label="Tab navigation">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            onMouseEnter={() => {
              // Preload при hover (улучшает UX)
              tab.component._init?.();
            }}
            aria-pressed={activeTab === tab.key}
            style={{
              margin: "0 5px",
              padding: "10px",
              backgroundColor: activeTab === tab.key ? "#ddd" : "#fff",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <ErrorBoundary>
        <TabContent />
      </ErrorBoundary>
    </div>
  );
};

// --- App Wrapper ---
const RootApp: React.FC = () => (
  <TabsProvider>
    <App />
  </TabsProvider>
);

export default RootApp;