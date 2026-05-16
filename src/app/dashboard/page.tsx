"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Placeholder data — will connect to Convex after setup
const mockAgreements = [
  {
    id: "1",
    landlord: "Ahmad Rosli",
    tenant: "Siti Aminah",
    property: "Ara Damansara",
    rent: 2500,
    status: "pending_review",
    date: "2026-05-16",
  },
  {
    id: "2",
    landlord: "Raju Kumar",
    tenant: "Mei Ling",
    property: "PJ Utama",
    rent: 800,
    status: "pending_stamp",
    date: "2026-05-15",
  },
  {
    id: "3",
    landlord: "Hassan Ali",
    tenant: "David Tan",
    property: "Subang Jaya",
    rent: 1800,
    status: "completed",
    date: "2026-05-14",
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  pending_review: { label: "Pending Review", variant: "default" },
  changes_requested: { label: "Changes Requested", variant: "destructive" },
  approved: { label: "Approved", variant: "secondary" },
  pending_stamp: { label: "Awaiting Stamp", variant: "default" },
  stamped: { label: "Stamped", variant: "secondary" },
  completed: { label: "Completed", variant: "secondary" },
};

export default function DashboardPage() {
  const counts = {
    pendingReview: mockAgreements.filter((a) => a.status === "pending_review").length,
    pendingStamp: mockAgreements.filter((a) => a.status === "pending_stamp").length,
    completed: mockAgreements.filter((a) => a.status === "completed").length,
    totalThisMonth: mockAgreements.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tenancy agreements</p>
        </div>
        <Link href="/dashboard/agreements/new">
          <Button>+ New Agreement</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{counts.pendingReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Awaiting Stamp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{counts.pendingStamp}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{counts.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{counts.totalThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Landlord</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Rent (RM)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAgreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell className="font-medium">{agreement.landlord}</TableCell>
                  <TableCell>{agreement.tenant}</TableCell>
                  <TableCell>{agreement.property}</TableCell>
                  <TableCell>RM {agreement.rent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[agreement.status]?.variant}>
                      {statusConfig[agreement.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{agreement.date}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/agreements/${agreement.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
