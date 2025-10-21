"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { aidPackagesAPI, donationsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Search, Globe, Clock, Users, TrendingUp, Wallet, Loader2, ExternalLink } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"

interface AidPackage {
  id: string
  title: string
  description: string
  ngo: {
    name: string
    organizationName: string
  }
  itemType: string
  quantity: number
  unit: string
  fundingGoal: number
  currentFunding: number
  urgencyLevel: string
  deliveryLocation: {
    city: string
    country: string
  }
  beneficiaryCount: number
  expectedDeliveryDate: string
  images: Array<{ url: string }>
  status: string
  createdAt: string
  transactionHash?: string
}

const mockAidPackages: AidPackage[] = [
  {
    id: "1",
    title: "Emergency Food Relief for Syrian Refugees",
    description:
      "Providing essential food supplies to displaced families in refugee camps. Each package contains rice, lentils, oil, and other basic necessities for a family of 5 for one month.",
    ngo: {
      name: "Global Aid Foundation",
      organizationName: "Global Aid Foundation",
    },
    itemType: "Food",
    quantity: 500,
    unit: "packages",
    fundingGoal: 25000,
    currentFunding: 18750,
    urgencyLevel: "Critical",
    deliveryLocation: {
      city: "Zaatari",
      country: "Jordan",
    },
    beneficiaryCount: 2500,
    expectedDeliveryDate: "2024-02-15",
    images: [{ url: "/placeholder-cstfq.png" }],
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Medical Supplies for Rural Clinic",
    description:
      "Essential medical supplies including antibiotics, bandages, and basic surgical equipment for a rural clinic serving 10,000 people.",
    ngo: {
      name: "Health Without Borders",
      organizationName: "Health Without Borders",
    },
    itemType: "Medicine",
    quantity: 1,
    unit: "shipment",
    fundingGoal: 15000,
    currentFunding: 8500,
    urgencyLevel: "High",
    deliveryLocation: {
      city: "Kampala",
      country: "Uganda",
    },
    beneficiaryCount: 10000,
    expectedDeliveryDate: "2024-02-28",
    images: [{ url: "/medical-supplies-still-life.png" }],
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Winter Clothing for Homeless Shelter",
    description:
      "Warm clothing including jackets, blankets, and boots for homeless individuals during the harsh winter months.",
    ngo: {
      name: "City Shelter Network",
      organizationName: "City Shelter Network",
    },
    itemType: "Clothing",
    quantity: 200,
    unit: "sets",
    fundingGoal: 12000,
    currentFunding: 4800,
    urgencyLevel: "Medium",
    deliveryLocation: {
      city: "Detroit",
      country: "USA",
    },
    beneficiaryCount: 200,
    expectedDeliveryDate: "2024-02-10",
    images: [{ url: "/winter-clothing-display.png" }],
    status: "active",
    createdAt: "2024-01-25",
  },
]

export default function DonorDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, walletAddress, isConnected, connectWallet } = useAuth()
  const [aidPackages, setAidPackages] = useState<AidPackage[]>([])
  const [filteredPackages, setFilteredPackages] = useState<AidPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterUrgency, setFilterUrgency] = useState("all")
  const [selectedPackage, setSelectedPackage] = useState<AidPackage | null>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [donationMessage, setDonationMessage] = useState("")
  const [isDonating, setIsDonating] = useState(false)
  const [userStats, setUserStats] = useState({
    totalDonated: 0,
    packagesSupported: 0,
    impactScore: 0,
  })
  const { toast } = useToast()

  const isDemoMode = searchParams?.get("demo") === "true"

  useEffect(() => {
    if (isDemoMode) {
      setAidPackages(mockAidPackages)
      setUserStats({
        totalDonated: 5420,
        packagesSupported: 8,
        impactScore: 542,
      })
      setLoading(false)
    } else if (user) {
      fetchAidPackages()
      fetchUserStats()
    }
  }, [user, isDemoMode])

  const fetchAidPackages = async () => {
    try {
      const response = await aidPackagesAPI.getAll()
      setAidPackages(response.data)
    } catch (error) {
      console.error("Error fetching aid packages:", error)
      toast({
        title: "Error",
        description: "Failed to load aid packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await donationsAPI.getByDonor(user!.id)
      const donations = response.data

      const totalDonated = donations.reduce((sum: number, donation: any) => sum + donation.amount, 0)
      const packagesSupported = new Set(donations.map((d: any) => d.packageId)).size

      setUserStats({
        totalDonated,
        packagesSupported,
        impactScore: Math.floor(totalDonated / 10),
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const filterPackages = () => {
    let filtered = aidPackages

    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.deliveryLocation.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.deliveryLocation.country.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((pkg) => pkg.itemType === filterType)
    }

    if (filterUrgency !== "all") {
      filtered = filtered.filter((pkg) => pkg.urgencyLevel === filterUrgency)
    }

    setFilteredPackages(filtered)
  }

  const handleDonate = async () => {
    if (!selectedPackage || !donationAmount) return

    if (!isDemoMode && !isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      await connectWallet()
      return
    }

    setIsDonating(true)

    try {
      const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (isDemoMode) {
        const updatedPackages = aidPackages.map((pkg) =>
          pkg.id === selectedPackage.id
            ? { ...pkg, currentFunding: pkg.currentFunding + Number.parseFloat(donationAmount) }
            : pkg,
        )
        setAidPackages(updatedPackages)

        setUserStats((prev) => ({
          totalDonated: prev.totalDonated + Number.parseFloat(donationAmount),
          packagesSupported: prev.packagesSupported,
          impactScore: prev.impactScore + Math.floor(Number.parseFloat(donationAmount) / 10),
        }))
      } else {
        const response = await donationsAPI.create({
          packageId: selectedPackage.id,
          amount: Number.parseFloat(donationAmount),
          message: donationMessage,
          transactionHash: simulatedTxHash,
          walletAddress,
        })
      }

      toast({
        title: "Donation Successful!",
        description: `Transaction: ${simulatedTxHash.substring(0, 10)}... Amount: $${donationAmount}`,
      })

      setDonationAmount("")
      setDonationMessage("")
      setSelectedPackage(null)

      if (!isDemoMode) {
        fetchAidPackages()
        fetchUserStats()
      }
    } catch (error: any) {
      console.error("Donation error:", error)
      toast({
        title: "Donation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsDonating(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-destructive text-destructive-foreground"
      case "High":
        return "bg-chart-5 text-white"
      case "Medium":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysRemaining = (dateString: string) => {
    const today = new Date()
    const deliveryDate = new Date(dateString)
    const diffTime = deliveryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  useEffect(() => {
    filterPackages()
  }, [searchTerm, filterType, filterUrgency, aidPackages])

  const DashboardContent = () => (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Donor Dashboard{" "}
              {isDemoMode && (
                <Badge variant="secondary" className="ml-2">
                  Demo Mode
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Discover and support aid packages that need your help</p>
          </div>
          {!isDemoMode && !isConnected && (
            <Button onClick={connectWallet} variant="outline">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
          {isDemoMode && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wallet className="h-4 w-4 mr-2" />
              Demo Wallet Connected
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats.totalDonated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {userStats.packagesSupported} packages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Packages Supported</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.packagesSupported}</div>
              <p className="text-xs text-muted-foreground">Active aid packages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.impactScore}</div>
              <p className="text-xs text-muted-foreground">Lives positively impacted</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Aid Packages</CardTitle>
            <CardDescription>Search and filter aid packages to find causes you care about</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={
                      pkg.images[0]?.url || `/placeholder.svg?height=200&width=300&query=${pkg.itemType} aid package`
                    }
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${getUrgencyColor(pkg.urgencyLevel)}`}>
                    {pkg.urgencyLevel}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{pkg.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {pkg.deliveryLocation.city}, {pkg.deliveryLocation.country}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        ${pkg.currentFunding.toLocaleString()} / ${pkg.fundingGoal.toLocaleString()}
                      </span>
                    </div>

                    <Progress value={(pkg.currentFunding / pkg.fundingGoal) * 100} className="h-2" />

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {pkg.beneficiaryCount} people
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {getDaysRemaining(pkg.expectedDeliveryDate)} days left
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{pkg.itemType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        by {pkg.ngo.organizationName || pkg.ngo.name}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedPackage(pkg)}>
                          <Heart className="w-4 h-4 mr-2" />
                          Donate Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Donate to Aid Package</DialogTitle>
                          <DialogDescription>Support {selectedPackage?.title}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Donation Amount (USD)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              min="1"
                              step="0.01"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Leave a message of support..."
                              value={donationMessage}
                              onChange={(e) => setDonationMessage(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleDonate}
                              disabled={!donationAmount || isDonating || (!isDemoMode && !isConnected)}
                              className="flex-1"
                            >
                              {isDonating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Wallet className="w-4 h-4 mr-2" />
                                  Donate ${donationAmount}
                                </>
                              )}
                            </Button>
                          </div>

                          {pkg.transactionHash && (
                            <div className="text-center">
                              <Button variant="link" size="sm" asChild>
                                <a
                                  href={`https://mumbai.polygonscan.com/tx/${pkg.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View on PolygonScan
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPackages.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No aid packages found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new packages.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )

  return isDemoMode ? (
    <DashboardContent />
  ) : (
    <ProtectedRoute allowedRoles={["donor"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
