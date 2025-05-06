import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from "@/components/profile/UserProfile";
import { GoogleCalendarSettings } from "@/components/settings/GoogleCalendarSettings";
import AISettings from "@/components/settings/AISettings";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          setUserProfile(data || { user_id: user.id });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card shadow-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold glow-text">
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 glass bg-opacity-30 border border-white/10">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="calendar">Calendar Integration</TabsTrigger>
                <TabsTrigger value="ai">AI Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                {userProfile && <UserProfile initialData={userProfile} />}
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <GoogleCalendarSettings />
              </TabsContent>

              <TabsContent value="ai" className="mt-6">
                <AISettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
