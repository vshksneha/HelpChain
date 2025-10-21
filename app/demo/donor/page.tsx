"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Heart, MapPin, Users, DollarSign, Clock } from "lucide-react"
import DemoHeader from "@/components/demo/DemoHeader"

interface AidPackage {
  id: string
  title: string
  description: string
  ngo: string
  location: string
  urgency: "Critical" | "High" | "Medium" | "Low"
  fundingGoal: number
  currentFunding: number
  donors: number
  daysLeft: number
  image: string
}

export default function DonorDemo() {
  const { toast } = useToast()
  const [donationAmounts, setDonationAmounts] = useState<Record<string, string>>({})
  const [packages, setPackages] = useState<AidPackage[]>([
    {
      id: "1",
      title: "Emergency Food Relief for Syrian Refugees",
      description: "Providing essential food supplies for 500 refugee families in Jordan camps.",
      ngo: "Global Relief Foundation",
      location: "Jordan",
      urgency: "Critical",
      fundingGoal: 25000,
      currentFunding: 18750,
      donors: 127,
      daysLeft: 3,
      image: "/placeholder.svg?height=200&width=300&text=Emergency+Food+Relief",
    },
    {
      id: "2",
      title: "Medical Supplies for Rural Clinics",
      description: "Essential medical equipment and supplies for remote healthcare facilities.",
      ngo: "Doctors Without Borders",
      location: "Kenya",
      urgency: "High",
      fundingGoal: 15000,
      currentFunding: 9300,
      donors: 89,
      daysLeft: 7,
      image: "/placeholder.svg?height=200&width=300&text=Medical+Supplies",
    },
    {
      id: "3",
      title: "Winter Clothing for Homeless Shelter",
      description: "Warm clothing and blankets for homeless individuals during winter months.",
      ngo: "City Shelter Network",
      location: "New York, USA",
      urgency: "Medium",
      fundingGoal: 8000,
      currentFunding: 2720,
      donors: 45,
      daysLeft: 14,
      image: "/placeholder.svg?height=200&width=300&text=Winter+Clothing",
    },
  ])

  const [userStats] = useState({
    totalDonated: 2450,
    packagesSupported: 8,
    impactScore: 92,
  })

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

  const handleDonation = (packageId: string) => {
    const amount = Number.parseFloat(donationAmounts[packageId] || "0")
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      })
      return
    }

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Update package funding
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              currentFunding: pkg.currentFunding + amount,
              donors: pkg.donors + 1,
            }
          : pkg,
      ),
    )

    // Clear donation amount
    setDonationAmounts((prev) => ({ ...prev, [packageId]: "" }))

    toast({
      title: "Donation Successful!",
      description: `$${amount} donated successfully. Transaction: ${txHash.substring(0, 10)}...`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DemoHeader title="Donor Dashboard" description="Testing donor dashboard functionality" />

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donated</p>
                  <p className="text-2xl font-bold text-cyan-600">${userStats.totalDonated.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Packages Supported</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.packagesSupported}</p>
                </div>
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Impact Score</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.impactScore}/100</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aid Packages */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Aid Packages</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const fundingPercentage = (pkg.currentFunding / pkg.fundingGoal) * 100

              return (
                <Card key={pkg.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <img src={pkg.image || "/placeholder.svg"} alt={pkg.title} className="w-full h-full object-cover" />
                    <Badge className={`absolute top-2 right-2 ${getUrgencyColor(pkg.urgency)} text-white`}>
                      {pkg.urgency}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {pkg.location}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {pkg.ngo}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span>{Math.round(fundingPercentage)}%</span>
                      </div>
                      <Progress value={fundingPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${pkg.currentFunding.toLocaleString()} raised</span>
                        <span>${pkg.fundingGoal.toLocaleString()} goal</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {pkg.donors} donors
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.daysLeft} days left
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount ($)"
                        value={donationAmounts[pkg.id] || ""}
                        onChange={(e) =>
                          setDonationAmounts((prev) => ({
                            ...prev,
                            [pkg.id]: e.target.value,
                          }))
                        }
                        className="flex-1"
                      />
                      <Button onClick={() => handleDonation(pkg.id)} className="bg-cyan-600 hover:bg-cyan-700">
                        Donate Now
                      </Button>
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
