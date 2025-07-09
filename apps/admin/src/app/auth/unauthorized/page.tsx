import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md border-red-200 bg-white/95 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">Access Denied</CardTitle>
          <CardDescription className="text-red-600">
            Admin privileges required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            You don&apos;t have permission to access the admin dashboard. 
            Only authorized administrators can view this area.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">Go to Main App</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Try Different Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}