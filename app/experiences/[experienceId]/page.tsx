import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExperienceDashboard } from "@/components/ExperienceDashboard";

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
      <ExperienceDashboard
        experienceId={experienceId}
        whopUserId={userId}
        whopUserName={user.name || 'User'}
        whopUsername={user.username || 'user'}
        experienceName={experience.name || 'Experience'}
        accessLevel={accessLevel}
      />
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

