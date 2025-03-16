import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Save, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getSession, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile = ({ onLogout = () => {} }: UserProfileProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    userId: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    weeklyReports: true,
    achievementAlerts: true,
    targetBalance: 15750,
    dailyGoal: 250,
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const session = await getSession();
        const user = session?.user;

        if (!user) {
          navigate("/");
          return;
        }

        // Set basic profile info from auth
        setProfile({
          name: user.user_metadata?.name || "",
          email: user.email || "",
          bio: "",
          avatar: user.user_metadata?.avatar_url || "",
          userId: user.id,
        });

        // Try to fetch additional profile data from database
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setProfile((prev) => ({
            ...prev,
            name: data.name || prev.name,
            bio: data.bio || "",
            avatar: data.avatar_url || prev.avatar,
          }));

          setSettings((prev) => ({
            ...prev,
            emailNotifications:
              data.email_notifications ?? prev.emailNotifications,
            darkMode: data.dark_mode ?? prev.darkMode,
            weeklyReports: data.weekly_reports ?? prev.weeklyReports,
            achievementAlerts:
              data.achievement_alerts ?? prev.achievementAlerts,
            targetBalance: data.target_balance ?? prev.targetBalance,
            dailyGoal: data.daily_goal ?? prev.dailyGoal,
          }));
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSaveSuccess(false);

      // Update user metadata in auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: profile.name },
      });

      if (updateError) throw updateError;

      // Upsert profile data in database
      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: profile.userId,
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar,
          email_notifications: settings.emailNotifications,
          dark_mode: settings.darkMode,
          weekly_reports: settings.weeklyReports,
          achievement_alerts: settings.achievementAlerts,
          target_balance: settings.targetBalance,
          daily_goal: settings.dailyGoal,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile changes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to log out");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (urlData) {
        setProfile((prev) => ({
          ...prev,
          avatar: urlData.publicUrl,
        }));
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="w-full bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center">
            <User className="mr-2 h-6 w-6" />
            User Profile & Settings
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">
                  Changes saved successfully!
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="profile" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={
                        profile.avatar ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                      }
                      alt={profile.name}
                    />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="relative">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        placeholder="Your full name"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      placeholder="Tell us a bit about yourself"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="email-notifications"
                        className="text-base"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          emailNotifications: checked,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports" className="text-base">
                        Weekly Reports
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly progress summaries
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, weeklyReports: checked })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="achievement-alerts" className="text-base">
                        Achievement Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you reach milestones
                      </p>
                    </div>
                    <Switch
                      id="achievement-alerts"
                      checked={settings.achievementAlerts}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, achievementAlerts: checked })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-base">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Use dark theme throughout the app
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, darkMode: checked })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <h3 className="text-lg font-medium">Mental Bank Goals</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-balance">Target Balance ($)</Label>
                      <Input
                        id="target-balance"
                        type="number"
                        min="0"
                        step="100"
                        value={settings.targetBalance}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            targetBalance: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your 3X financial goal
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="daily-goal">Daily Deposit Goal ($)</Label>
                      <Input
                        id="daily-goal"
                        type="number"
                        min="0"
                        step="10"
                        value={settings.dailyGoal}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            dailyGoal: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target amount to add daily
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>

            <Button onClick={handleSaveProfile} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
