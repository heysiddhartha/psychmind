// System Settings Management Component for Super Admin
import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSystemSettings, updateSystemSetting, SystemSetting } from '@/lib/services/adminService';

interface SettingGroup {
    category: string;
    label: string;
    description: string;
    icon: string;
}

const settingGroups: SettingGroup[] = [
    { category: 'general', label: 'General', description: 'Platform name, contact info, maintenance mode', icon: '⚙️' },
    { category: 'booking', label: 'Booking', description: 'Session duration, cancellation policy, buffer time', icon: '📅' },
    { category: 'payment', label: 'Payment', description: 'Currency, rates, Stripe integration', icon: '💳' },
    { category: 'email', label: 'Email', description: 'SMTP settings, sender details, templates', icon: '📧' },
    { category: 'notifications', label: 'Notifications', description: 'Alert preferences, reminder timing', icon: '🔔' },
    { category: 'security', label: 'Security', description: 'Password policy, session timeout, 2FA', icon: '🔒' },
];

export default function SystemSettingsManager() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('general');
    const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSystemSettings();
            setSettings(data);
            // Initialize edited values
            const values: Record<string, unknown> = {};
            data.forEach(s => {
                values[`${s.category}.${s.key}`] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
            });
            setEditedValues(values);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (category: string, key: string) => {
        const settingKey = `${category}.${key}`;
        setSaving(settingKey);
        try {
            const result = await updateSystemSetting(category, key, editedValues[settingKey]);
            if (!result.success) throw new Error(result.error);
            toast({ title: 'Setting Updated', description: `${key} has been saved successfully.` });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save setting';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setSaving(null);
        }
    };

    const handleValueChange = (category: string, key: string, value: unknown) => {
        setEditedValues(prev => ({
            ...prev,
            [`${category}.${key}`]: value
        }));
    };

    const categorySettings = settings.filter(s => s.category === activeCategory);

    const renderSettingInput = (setting: SystemSetting) => {
        const key = `${setting.category}.${setting.key}`;
        const value = editedValues[key];

        if (typeof value === 'boolean') {
            return (
                <button
                    onClick={() => handleValueChange(setting.category, setting.key, !value)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-7' : 'left-1'}`} />
                </button>
            );
        }

        if (typeof value === 'number') {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleValueChange(setting.category, setting.key, parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 text-right"
                />
            );
        }

        if (setting.key.includes('password') || setting.key.includes('secret') || setting.key.includes('key')) {
            return (
                <input
                    type="password"
                    value={String(value || '')}
                    onChange={(e) => handleValueChange(setting.category, setting.key, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="••••••••"
                />
            );
        }

        return (
            <input
                type="text"
                value={String(value || '')}
                onChange={(e) => handleValueChange(setting.category, setting.key, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {settingGroups.map(group => (
                    <button
                        key={group.category}
                        onClick={() => setActiveCategory(group.category)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeCategory === group.category
                            ? 'bg-slate-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <span>{group.icon}</span>
                        {group.label}
                    </button>
                ))}
            </div>

            {/* Settings List */}
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                        {settingGroups.find(g => g.category === activeCategory)?.label} Settings
                    </h3>
                    <p className="text-sm text-gray-500">
                        {settingGroups.find(g => g.category === activeCategory)?.description}
                    </p>
                </div>

                <div className="divide-y">
                    {categorySettings.length > 0 ? (
                        categorySettings.map(setting => (
                            <div key={setting.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 capitalize">
                                            {setting.key.replace(/_/g, ' ')}
                                        </p>
                                        {setting.description && (
                                            <p className="text-sm text-gray-500">{setting.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {renderSettingInput(setting)}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSave(setting.category, setting.key)}
                                            disabled={saving === `${setting.category}.${setting.key}`}
                                        >
                                            {saving === `${setting.category}.${setting.key}` ? (
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>No settings found for this category</p>
                            <p className="text-sm mt-1">Settings will appear here once they are configured in the database.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Important</p>
                        <p className="text-sm text-amber-700">
                            Changes to some settings may require a page refresh to take effect.
                            Be careful when modifying security or payment settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
