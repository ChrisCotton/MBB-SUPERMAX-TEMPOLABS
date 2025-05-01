import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mental Bank Balance System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>Manage your high-value activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Track tasks, assign categories, and calculate your mental bank
              balance.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/tasks">Go to Tasks</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Organize your activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create and manage categories with preset hourly rates.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/categories">Manage Categories</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Charts</CardTitle>
            <CardDescription>Visualize your growth</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              View charts showing your mental bank balance growth over time.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/charts">View Charts</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Set and track your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create goals and track your progress toward achieving them.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/goals">Manage Goals</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal</CardTitle>
            <CardDescription>Record your thoughts</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Keep a journal of your progress and insights.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/journal">Open Journal</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Update your profile and preferences.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/profile">View Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
