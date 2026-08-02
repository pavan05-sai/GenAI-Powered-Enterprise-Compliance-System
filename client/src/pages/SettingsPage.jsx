import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building, Sliders, Key, Bell, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Riya Sharma',
    email: user?.email || 'riya.sharma@example.com',
    role: user?.role || 'Compliance Officer',
    phone: '+91 98765 43210',
    orgName: 'Acme Enterprise',
    industry: 'Financial Technology & Services',
    lyzrApiKey: 'lyzr_prod_live_998127394812',
    neo4jUri: 'bolt://localhost:7687'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settingsTabs = [
    { name: 'Profile', icon: User },
    { name: 'Organization', icon: Building },
    { name: 'Preferences', icon: Sliders },
    { name: 'API Keys', icon: Key },
    { name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1A1918]">Settings</h1>
        <p className="text-xs text-[#6E6B62] mt-0.5">Manage your profile and workspace preferences.</p>
      </div>

      {/* Grid matching bottom middle screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Settings Navigation */}
        <div className="veritas-card p-2 space-y-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.name
                    ? 'bg-[#1A1918] text-white'
                    : 'text-[#6E6B62] hover:bg-[#F0ECE1] hover:text-[#1A1918]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Settings Form */}
        <div className="md:col-span-3 veritas-card p-6">
          {activeTab === 'Profile' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-xl">
              <h2 className="font-serif text-lg font-bold text-[#1A1918] pb-3 border-b border-[#E6E2D8]">Profile</h2>

              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#8C6B1B] text-white text-2xl font-serif font-bold flex items-center justify-center shadow-md">
                  {formData.fullName.charAt(0)}
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-[#1A1918] bg-[#F7F5F0] hover:bg-[#EAE5D8] border border-[#E6E2D8] rounded-md transition-colors"
                >
                  Change Photo
                </button>
              </div>

              {/* Form Inputs matching screenshot */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#8C6B1B] hover:bg-[#735714] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
              </button>
            </form>
          )}

          {activeTab === 'API Keys' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="font-serif text-lg font-bold text-[#1A1918] pb-3 border-b border-[#E6E2D8]">API Keys & Service Integrations</h2>
              
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Lyzr AI API Key</label>
                <input
                  type="password"
                  name="lyzrApiKey"
                  value={formData.lyzrApiKey}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg text-[#1A1918]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6E6B62] mb-1">Neo4j Aura URI</label>
                <input
                  type="text"
                  name="neo4jUri"
                  value={formData.neo4jUri}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg text-[#1A1918]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
