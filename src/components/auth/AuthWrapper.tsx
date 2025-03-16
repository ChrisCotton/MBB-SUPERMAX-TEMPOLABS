import React, { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <div className="rounded-full bg-primary p-2 inline-block mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Mental Bank Task Manager</h1>
            <p className="text-muted-foreground mt-2">
              Track high-value activities and reinforce positive financial
              programming
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm
                onSuccess={() => setIsAuthenticated(true)}
                onRegisterClick={() => setActiveTab("register")}
              />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm
                onSuccess={() => setActiveTab("login")}
                onLoginClick={() => setActiveTab("login")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
