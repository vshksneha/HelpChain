"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Plus, Package, DollarSign, Users, MapPin, Calendar, Edit, Trash2 } from "lucide-react"
import DemoHeader from "@/components/demo/DemoHeader"

interface AidPackage {
  id: string
  title: string
  description: string
  location: string
  urgency: "Critical" | "High" | "Medium" | "Low"
  fundingGoal: number
  currentFunding: number
  donors: number
  createdDate: string
  status: "Active" | "Funded" | "Delivered"
}

export default function NGODemo() {
  const { toast } = useToast()
  const [packages] = useState<AidPackage[]>([
    {
      id: "1",
      title: "Emergency Food Relief for Syrian Refugees",
      description: "Providing essential food supplies for 500 refugee families in Jordan camps.",
      location: "Jordan",
      urgency: "Critical",
      fundingGoal: 25000,
      currentFunding: 18750,
      donors: 127,
      createdDate: "2024-01-15",
      status: "Active",
    },
    {
      id: "2",
      title: "Medical Supplies for Rural Clinics",
      description: "Essential medical equipment and supplies for remote healthcare facilities.",
      location: "Kenya",
      urgency: "High",
      fundingGoal: 15000,
      currentFunding: 15000,
      donors: 89,
      createdDate: "2024-01-10",
      status: "Funded",
    },
    {
      id: "3",
      title: "Educational Materials for Children",
      description: "Books, supplies, and learning materials for underprivileged children.",
      location: "Bangladesh",
      urgency: "Medium",
      fundingGoal: 8000,
      currentFunding: 3200,
      donors: 45,
      createdDate: "2024-01-20",
      status: "Active",
    },
  ])

  const [orgStats] = useState({
    totalPackages: 3,
    totalRaised: 36950,
    totalDonors: 261,
    activePackages: 2,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-500"
      case "Funded":
        return "bg-green-500"
      case "Delivered":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500"
      case "High":
        return "bg-orange-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleCreatePackage = () => {
    toast({
      title: "Create Aid Package",
      description: "Package creation form would open here in the full application.",
    })
  }

  const handleEditPackage = (packageId: string) => {
    toast({
      title: "Edit Package",
      description: `Edit form for package ${packageId} would open here.`,
    })
  }

  const handleDeletePackage = (packageId: string) => {
    toast({
      title: "Delete Package",
      description: `Package ${packageId} would be deleted after confirmation.`,
      variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DemoHeader title="NGO Dashboard" description="Testing NGO dashboard functionality" />

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">Manage your humanitarian aid packages and track funding progress</p>
          <Button onClick={handleCreatePackage} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Aid Package
          </Button>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Packages</p>
                  <p className="text-2xl font-bold text-cyan-600">{orgStats.totalPackages}</p>
                </div>
                <Package className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-green-600">${orgStats.totalRaised.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donors</p>
                  <p className="text-2xl font-bold text-purple-600">{orgStats.totalDonors}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Packages</p>
                  <p className="text-2xl font-bold text-orange-600">{orgStats.activePackages}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aid Packages */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Aid Packages</h2>

          <div className="space-y-4">
            {packages.map((pkg) => {
              const fundingPercentage = (pkg.currentFunding / pkg.fundingGoal) * 100
              const averageDonation = Math.round(pkg.currentFunding / pkg.donors)

              return (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(pkg.status)} text-white`}>{pkg.status}</Badge>
                          <Badge className={`${getUrgencyColor(pkg.urgency)} text-white`}>{pkg.urgency}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {pkg.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Created {pkg.createdDate}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span>{Math.round(fundingPercentage)}% funded</span>
                      </div>
                      <Progress value={fundingPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          ${pkg.currentFunding.toLocaleString()} / ${pkg.fundingGoal.toLocaleString()}
                        </span>
                        <span>{pkg.donors} people contributed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Donors: </span>
                        <span className="font-semibold">{pkg.donors} people contributed</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Average Donation: </span>
                        <span className="font-semibold">${averageDonation} per donor</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
