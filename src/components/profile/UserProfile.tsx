import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfileProps {
  initialData?: any;
}

const UserProfile = ({ initialData }: UserProfileProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    display_name: "",
    bio: "",
    website: "",
    location: "",
    occupation: "",
    hourly_rate: "",
    target_balance: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || "",
        display_name: initialData.display_name || "",
        bio: initialData.bio || "",
        website: initialData.website || "",
        location: initialData.location || "",
        occupation: initialData.occupation || "",
        hourly_rate: initialData.hourly_rate?.toString() || "",
        target_balance: initialData.target_balance?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Convert numeric fields
      const dataToUpdate = {
        ...formData,
        hourly_rate: formData.hourly_rate
          ? parseFloat(formData.hourly_rate)
          : null,
        target_balance: formData.target_balance
          ? parseFloat(formData.target_balance)
          : null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from("user_profiles")
          .update(dataToUpdate)
          .eq("user_id", user.id);
      } else {
        // Insert new profile
        result = await supabase.from("user_profiles").insert({
          ...dataToUpdate,
          created_at: new Date().toISOString(),
        });
      }

      if (result.error) throw result.error;

      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card shadow-md border border-white/10">
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Default Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_balance">
                Target Mental Bank Balance ($)
              </Label>
              <Input
                id="target_balance"
                name="target_balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.target_balance}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="glass-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
