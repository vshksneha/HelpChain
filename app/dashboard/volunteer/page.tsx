"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { aidPackagesAPI, deliveriesAPI } from "@/lib/api"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Truck, Package, MapPin, CheckCircle, ExternalLink } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"

interface AidPackage {
  _id: string
  title: string
  description: string
  itemType: string
  quantity: number
  location: string
  fundingGoal: number
  currentFunding: number
  status: string
  ngoId: {
    organizationName: string
  }
}

interface Delivery {
  _id: string
  packageId: AidPackage
  status: string
  pledgeDate: string
  deliveryDate?: string
  statusUpdates: Array<{
    status: string
    timestamp: string
  }>
  transactionHash?: string
}

export default function VolunteerDashboard() {
  const { user, walletAddress } = useAuth()
  const [availablePackages, setAvailablePackages] = useState<AidPackage[]>([])
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [pledging, setPledging] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [confirmationData, setConfirmationData] = useState({
    otp: "",
    proof: "",
    notes: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const availableRes = await aidPackagesAPI.getReadyForDelivery()
      setAvailablePackages(availableRes.data)

      const deliveriesRes = await deliveriesAPI.getByVolunteer(user!.id)
      setMyDeliveries(deliveriesRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const pledgeDelivery = async (packageId: string) => {
    try {
      setPledging(packageId)

      await deliveriesAPI.pledge({
        packageId,
        volunteerAddress: walletAddress || "",
      })

      toast.success("Delivery pledged successfully!")
      fetchData() // Refresh data
    } catch (error: any) {
      console.error("Error pledging delivery:", error)
      toast.error(error.response?.data?.message || "Failed to pledge delivery")
    } finally {
      setPledging(null)
    }
  }

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      setUpdatingStatus(deliveryId)

      await deliveriesAPI.updateStatus(deliveryId, { status })

      toast.success("Status updated successfully!")
      fetchData() // Refresh data
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error(error.response?.data?.message || "Failed to update status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const confirmDelivery = async (deliveryId: string) => {
    try {
      if (!confirmationData.otp || !confirmationData.proof) {
        toast.error("Please provide OTP and delivery proof")
        return
      }

      await deliveriesAPI.confirm(deliveryId, {
        otp: confirmationData.otp,
        deliveryProof: confirmationData.proof,
        notes: confirmationData.notes,
      })

      toast.success("Delivery confirmed successfully!")
      setConfirmationData({ otp: "", proof: "", notes: "" })
      fetchData() // Refresh data
    } catch (error: any) {
      console.error("Error confirming delivery:", error)
      toast.error(error.response?.data?.message || "Failed to confirm delivery")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["volunteer"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Dashboard</h1>
            <p className="text-gray-600">Manage your delivery assignments and find new opportunities to help.</p>
          </div>

          {/* Available Packages Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6 text-cyan-600" />
              Available for Delivery
            </h2>

            {availablePackages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No packages available for delivery at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availablePackages.map((pkg) => (
                  <Card key={pkg._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg.title}</CardTitle>
                      <CardDescription>{pkg.ngoId.organizationName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">{pkg.description}</p>

                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span>
                            {pkg.quantity} {pkg.itemType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{pkg.location}</span>
                        </div>

                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Fully Funded
                        </Badge>

                        <Button
                          onClick={() => pledgeDelivery(pkg._id)}
                          disabled={pledging === pkg._id}
                          className="w-full bg-cyan-600 hover:bg-cyan-700"
                        >
                          {pledging === pkg._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Pledging...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4 mr-2" />
                              Pledge to Deliver
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* My Deliveries Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Truck className="h-6 w-6 text-cyan-600" />
              My Deliveries
            </h2>

            {myDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't pledged any deliveries yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {myDeliveries.map((delivery) => (
                  <Card key={delivery._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{delivery.packageId.title}</CardTitle>
                      <CardDescription>Pledged on {new Date(delivery.pledgeDate).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{delivery.packageId.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge
                            variant={
                              delivery.status === "delivered"
                                ? "default"
                                : delivery.status === "in_transit"
                                  ? "secondary"
                                  : delivery.status === "picked_up"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {delivery.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        {delivery.status === "pledged" && (
                          <Button
                            onClick={() => updateDeliveryStatus(delivery._id, "picked_up")}
                            disabled={updatingStatus === delivery._id}
                            className="w-full"
                            variant="outline"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark as Picked Up
                          </Button>
                        )}

                        {delivery.status === "picked_up" && (
                          <Button
                            onClick={() => updateDeliveryStatus(delivery._id, "in_transit")}
                            disabled={updatingStatus === delivery._id}
                            className="w-full"
                            variant="outline"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as In Transit
                          </Button>
                        )}

                        {delivery.status === "in_transit" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Delivery
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Delivery</DialogTitle>
                                <DialogDescription>
                                  Please provide the required information to confirm delivery completion.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="otp">Recipient OTP *</Label>
                                  <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={confirmationData.otp}
                                    onChange={(e) => setConfirmationData({ ...confirmationData, otp: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="proof">Delivery Proof *</Label>
                                  <Input
                                    id="proof"
                                    placeholder="Photo URL or description"
                                    value={confirmationData.proof}
                                    onChange={(e) =>
                                      setConfirmationData({ ...confirmationData, proof: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="notes">Additional Notes</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Any additional notes about the delivery..."
                                    value={confirmationData.notes}
                                    onChange={(e) =>
                                      setConfirmationData({ ...confirmationData, notes: e.target.value })
                                    }
                                  />
                                </div>
                                <Button onClick={() => confirmDelivery(delivery._id)} className="w-full">
                                  Confirm Delivery
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {delivery.status === "delivered" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Delivered on {new Date(delivery.deliveryDate!).toLocaleDateString()}
                              </span>
                            </div>
                            {delivery.transactionHash && (
                              <Button variant="link" size="sm" asChild>
                                <a
                                  href={`https://mumbai.polygonscan.com/tx/${delivery.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View on PolygonScan
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
