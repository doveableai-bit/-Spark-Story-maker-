import React from 'react';
import { LayoutDashboard, Film, MessageSquare, Settings, Library } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'studio', label: 'Story Studio', icon: Film },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'library', label: 'My Library', icon: Library },
  ];

  return (
    <div className="w-64 h-screen bg-[#0f1115] border-r border-neutral-800 flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
        <h1 className="font-bold text-xl tracking-tight text-white">Spark Story Maker</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white cursor-pointer">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;