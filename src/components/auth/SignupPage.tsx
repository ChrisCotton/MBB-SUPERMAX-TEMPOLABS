import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import RegisterForm from "./RegisterForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/30 p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card shadow-md border border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold glow-text">
              <span className="text-3xl mr-2 glow-text">$</span>
              Mental Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
