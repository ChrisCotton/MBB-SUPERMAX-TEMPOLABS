import React from "react";
import Header from "@/components/dashboard/Header";
import UserProfile from "@/components/profile/UserProfile";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
        onLogout={() => console.log("Logout clicked")}
      />

      <main className="container mx-auto px-4 py-8">
        <UserProfile />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-white"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-sm font-medium">
                Mental Bank Task Manager
              </span>
            </div>

            <div className="mt-4 md:mt-0">
              <nav className="flex space-x-4">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Contact
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mental Bank Task Manager. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
