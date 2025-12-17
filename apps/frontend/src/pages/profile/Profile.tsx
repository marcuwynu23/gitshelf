import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs, Button, Input, Alert} from "~/components/ui";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  bio?: string;
}

export const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Replace with actual API endpoint
        const res = await axios.get<UserProfile>("/api/user/profile");
        setProfile(res.data);
        setFormData({
          name: res.data.name,
          email: res.data.email,
          bio: res.data.bio || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace with actual API endpoint
      await axios.put("/api/user/profile", {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      });
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace with actual API endpoint
      await axios.put("/api/user/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess("Password changed successfully");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [
    {
      label: "Profile",
    },
  ];

  if (loading) {
    return (
      <MainLayout activeSidebarItem="settings">
        <div className="h-full flex items-center justify-center">
          <p className="text-[#b0b0b0]">Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeSidebarItem="settings">
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] mb-1">
            Profile
          </h1>
          <p className="text-sm text-[#b0b0b0]">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Profile Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="mb-4">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full mx-auto border-2 border-[#3d3d3d]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto bg-app-accent/10 flex items-center justify-center border-2 border-[#3d3d3d]">
                        <UserIcon className="w-12 h-12 text-app-accent" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-semibold text-[#e8e8e8] mb-2">
                    {profile?.name || "User"}
                  </h2>

                  {/* Email */}
                  <div className="flex items-center justify-center gap-2 text-sm text-[#b0b0b0] mb-4">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{profile?.email}</span>
                  </div>

                  {/* Member Since */}
                  {profile?.createdAt && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#808080] mb-4">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Member since{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {profile?.bio && (
                    <p className="text-sm text-[#b0b0b0] mb-4">{profile.bio}</p>
                  )}

                  {/* Settings Link */}
                  <Link to="/settings">
                    <Button variant="secondary" className="w-full">
                      Account Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                  Profile Information
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#e8e8e8] mb-1.5">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-3 py-2 bg-app-surface border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors resize-none"
                    />
                  </div>

                  <Button onClick={handleUpdateProfile} disabled={saving}>
                    {saving ? "Saving..." : "Update Profile"}
                  </Button>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                  Change Password
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                  />

                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    helperText="Must be at least 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                  />

                  <Button
                    onClick={handleChangePassword}
                    disabled={saving}
                    variant="secondary"
                  >
                    {saving ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
