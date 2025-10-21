"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { aidPackagesAPI } from "@/lib/api"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package, MapPin, Calendar, ExternalLink } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"

interface AidPackage {
  _id: string
  title: string
  description: string
  itemType: string
  quantity: number
  fundingGoal: number
  currentFunding: number
  status: string
  location: string
  urgencyLevel: string
  createdAt: string
  transactionHash?: string
  imageUrl?: string
}

export default function NGODashboard() {
  const { user } = useAuth()
  const [myPackages, setMyPackages] = useState<AidPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    itemType: "",
    quantity: "",
    fundingGoal: "",
    location: "",
    urgencyLevel: "medium",
    imageUrl: "",
  })

  useEffect(() => {
    if (user) {
      fetchMyPackages()
    }
  }, [user])

  const fetchMyPackages = async () => {
    try {
      const response = await aidPackagesAPI.getByNGO(user!.id)
      setMyPackages(response.data)
    } catch (error) {
      toast.error("Failed to fetch your aid packages")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.itemType ||
      !formData.quantity ||
      !formData.fundingGoal ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setCreating(true)

    try {
      const packageData = {
        ...formData,
        quantity: Number.parseInt(formData.quantity),
        fundingGoal: Number.parseFloat(formData.fundingGoal),
      }

      await aidPackagesAPI.create(packageData)
      toast.success("Aid package created successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        itemType: "",
        quantity: "",
        fundingGoal: "",
        location: "",
        urgencyLevel: "medium",
        imageUrl: "",
      })

      setShowCreateDialog(false)
      fetchMyPackages() // Refresh packages
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create aid package"
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "funded":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ngo"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Aid Packages</h1>
              <p className="text-gray-600 mt-2">Create and manage your humanitarian aid requests</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Aid Package</DialogTitle>
                  <DialogDescription>Fill in the details for your humanitarian aid request.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Package Title *</Label>
                    <Input
                      id="title"
                      placeholder="Emergency Food Supplies for Flood Victims"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the aid package and its purpose..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemType">Item Type *</Label>
                    <Select
                      value={formData.itemType}
                      onValueChange={(value) => setFormData({ ...formData, itemType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="medical">Medical Supplies</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="shelter">Shelter Materials</SelectItem>
                        <SelectItem value="education">Educational Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="100"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fundingGoal">Funding Goal (USD) *</Label>
                    <Input
                      id="fundingGoal"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={formData.fundingGoal}
                      onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select
                      value={formData.urgencyLevel}
                      onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreatePackage} disabled={creating} className="bg-cyan-600 hover:bg-cyan-700">
                    {creating ? "Creating..." : "Create Package"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPackages.map((pkg) => (
              <Card key={pkg._id} className="hover:shadow-lg transition-shadow">
                {pkg.imageUrl && (
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={pkg.imageUrl || "/placeholder.svg"}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(pkg.status)}>{pkg.status}</Badge>
                      <Badge className={getUrgencyColor(pkg.urgencyLevel)}>{pkg.urgencyLevel}</Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>
                      {pkg.itemType} - {pkg.quantity} units
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(pkg.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span>{Math.round((pkg.currentFunding / pkg.fundingGoal) * 100)}%</span>
                    </div>
                    <Progress value={(pkg.currentFunding / pkg.fundingGoal) * 100} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${pkg.currentFunding.toLocaleString()} raised</span>
                      <span>Goal: ${pkg.fundingGoal.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Edit Package
                  </Button>

                  {pkg.transactionHash && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${pkg.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on PolygonScan
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {myPackages.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No aid packages created yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first humanitarian aid request to start receiving donations.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
