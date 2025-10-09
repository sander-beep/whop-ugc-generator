import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  try {
    // The headers contain the user token
    const headersList = await headers();

    // The experienceId is a path param
    const { experienceId } = await params;

    // The user token is in the headers
    const { userId } = await whopSdk.verifyUserToken(headersList);

    // Check if user has access to this experience
    const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    const user = await whopSdk.users.getUser({ userId });
    const experience = await whopSdk.experiences.getExperience({ experienceId });

    // Either: 'admin' | 'customer' | 'no_access';
    // 'admin' means the user is an admin of the whop, such as an owner or moderator
    // 'customer' means the user is a common member in this whop
    // 'no_access' means the user does not have access to the whop
    const { accessLevel, hasAccess } = accessResult;

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have access to this experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 mb-4">
                Please contact the administrator or purchase access to continue.
              </p>
              <Link href="/">
                <Button className="w-full">Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome to {experience.name}!
              </CardTitle>
              <CardDescription>
                Hi <strong>{user.name}</strong> (@{user.username})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Access Level:</span>
                  <p className="font-medium capitalize">{accessLevel}</p>
                </div>
                <div>
                  <span className="text-neutral-500">User ID:</span>
                  <p className="font-mono text-xs">{userId}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Get Started</h3>
                <div className="grid gap-3">
                  <Link href="/create">
                    <Button className="w-full">Create New UGC Ad</Button>
                  </Link>
                  <Link href="/tokens">
                    <Button variant="outline" className="w-full">
                      Manage Tokens
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in experience page:", error);
    
    // If there's an error (e.g., user not authenticated via Whop), show error
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              Unable to verify your Whop authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              This app must be accessed through Whop. Please make sure you're logged into Whop and accessing the app from your Whop dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

