import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  // The headers contains the user token
  const headersList = await headers();

  // The companyId is a path param
  const { companyId } = await params;

  // The user token is in the headers
  const { userId } = await whopSdk.verifyUserToken(headersList);

  const result = await whopSdk.access.checkIfUserHasAccessToCompany({
    userId,
    companyId,
  });

  const user = await whopSdk.users.getUser({ userId });
  const company = await whopSdk.companies.getCompany({ companyId });

  // Either: 'admin' | 'no_access';
  // 'admin' means the user is an admin of the company, such as an owner or moderator
  // 'no_access' means the user is not an authorized member of the company
  const { accessLevel, hasAccess } = result;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have admin access to this company dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Only company owners and moderators can access this page.
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              Company Dashboard: {company.title}
            </CardTitle>
            <CardDescription>
              Manage your company settings and view analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Your Role:</span>
                <p className="font-medium capitalize text-foreground">{accessLevel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Company ID:</span>
                <p className="font-mono text-xs text-foreground">{companyId}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3 text-foreground">Admin Information</h3>
              <div className="space-y-2 text-sm text-foreground">
                <p>
                  <strong>Admin:</strong> {user.name} (@{user.username})
                </p>
                <p>
                  <strong>User ID:</strong> <code className="text-xs">{userId}</code>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3 text-foreground">Quick Actions</h3>
              <div className="grid gap-3">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to App Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

