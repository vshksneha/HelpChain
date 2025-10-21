"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Truck, MapPin, Phone, Calendar, Package, CheckCircle, Clock, AlertCircle } from "lucide-react"
import DemoHeader from "@/components/demo/DemoHeader"

interface Delivery {
  id: string
  packageTitle: string
  ngo: string
  urgency: "Critical" | "High" | "Medium" | "Low"
  status: "Available" | "Pledged" | "In Transit" | "Delivered"
  pickupLocation: string
  deliveryLocation: string
  recipient: string
  contact: string
  dueDate: string
  specialInstructions?: string
  deliveryOTP?: string
  deliveryNotes?: string
}

export default function VolunteerDemo() {
  const { toast } = useToast()
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: "1",
      packageTitle: "Emergency Food Relief for Syrian Refugees",
      ngo: "Global Relief Foundation",
      urgency: "Critical",
      status: "Pledged",
      pickupLocation: "Amman Distribution Center, Jordan",
      deliveryLocation: "Al-Zaatari Refugee Camp, Jordan",
      recipient: "Al-Zaatari Refugee Camp",
      contact: "+962-7-9876-5432",
      dueDate: "2024-01-25",
      specialInstructions: "Requires refrigerated transport for perishable items",
    },
    {
      id: "2",
      packageTitle: "Medical Supplies for Rural Clinics",
      ngo: "Doctors Without Borders",
      urgency: "High",
      status: "In Transit",
      pickupLocation: "Nairobi Medical Warehouse, Kenya",
      deliveryLocation: "Kibera Health Clinic, Nairobi",
      recipient: "Kibera Health Clinic",
      contact: "+254-7-1234-5678",
      dueDate: "2024-01-23",
      deliveryOTP: "Enter OTP",
      deliveryNotes: "Delivery notes",
    },
    {
      id: "3",
      packageTitle: "Educational Materials for Children",
      ngo: "Education First",
      urgency: "Medium",
      status: "Delivered",
      pickupLocation: "Dhaka Supply Hub, Bangladesh",
      deliveryLocation: "Cox's Bazar Learning Center",
      recipient: "Rohingya Learning Center",
      contact: "+880-1-7777-8888",
      dueDate: "2024-01-20",
      deliveryOTP: "Confirmed",
      deliveryNotes: "Successfully delivered to school administrator",
    },
    {
      id: "4",
      packageTitle: "Winter Clothing for Homeless Shelter",
      ngo: "City Shelter Network",
      urgency: "Medium",
      status: "Available",
      pickupLocation: "Community Donation Center, NYC",
      deliveryLocation: "Downtown Homeless Shelter, NYC",
      recipient: "Downtown Homeless Shelter",
      contact: "+1-555-0123",
      dueDate: "2024-01-28",
      specialInstructions: "Large delivery - may require multiple trips",
    },
  ])

  const [volunteerStats] = useState({
    totalDeliveries: 3,
    completed: 0,
    inProgress: 0,
    available: 1,
  })

  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500"
      case "Pledged":
        return "bg-blue-500"
      case "In Transit":
        return "bg-orange-500"
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

  const handlePledgeDelivery = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((delivery) => (delivery.id === deliveryId ? { ...delivery, status: "Pledged" as const } : delivery)),
    )

    toast({
      title: "Delivery Pledged",
      description: "You have successfully pledged to handle this delivery.",
    })
  }

  const handleStartDelivery = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "In Transit" as const, deliveryOTP: "Enter OTP", deliveryNotes: "Delivery notes" }
          : delivery,
      ),
    )

    toast({
      title: "Delivery Started",
      description: "Delivery status updated to In Transit. Safe travels!",
    })
  }

  const handleCompleteDelivery = (deliveryId: string) => {
    const otp = otpInputs[deliveryId]
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid delivery confirmation code.",
        variant: "destructive",
      })
      return
    }

    setDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              status: "Delivered" as const,
              deliveryOTP: "Confirmed",
              deliveryNotes: "Successfully delivered and confirmed",
            }
          : delivery,
      ),
    )

    // Generate blockchain transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    toast({
      title: "Delivery Completed!",
      description: `Delivery confirmed successfully. Blockchain proof: ${txHash.substring(0, 10)}...`,
    })

    // Clear OTP input
    setOtpInputs((prev) => ({ ...prev, [deliveryId]: "" }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DemoHeader title="Volunteer Dashboard" description="Testing volunteer dashboard functionality" />

        <p className="text-gray-600 mb-8">Manage your delivery assignments and help distribute aid packages</p>

        {/* Volunteer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-cyan-600">{volunteerStats.totalDeliveries}</p>
                </div>
                <Truck className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{volunteerStats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{volunteerStats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-blue-600">{volunteerStats.available}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">My Deliveries</h2>

          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{delivery.packageTitle}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(delivery.status)} text-white`}>{delivery.status}</Badge>
                        <Badge className={`${getUrgencyColor(delivery.urgency)} text-white`}>{delivery.urgency}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    NGO: {delivery.ngo}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">Pickup Location</p>
                          <p className="text-gray-600">{delivery.pickupLocation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Delivery Location</p>
                          <p className="text-gray-600">{delivery.deliveryLocation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Recipient: {delivery.recipient}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Contact: {delivery.contact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <p>
                      <span className="font-medium">Due:</span> {delivery.dueDate}
                    </p>
                  </div>

                  {delivery.specialInstructions && (
                    <div className="flex items-start gap-2 text-sm bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Special Instructions:</p>
                        <p className="text-amber-700">{delivery.specialInstructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {delivery.status === "Available" && (
                      <Button
                        onClick={() => handlePledgeDelivery(delivery.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Pledge Delivery
                      </Button>
                    )}

                    {delivery.status === "Pledged" && (
                      <Button
                        onClick={() => handleStartDelivery(delivery.id)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Start Delivery
                      </Button>
                    )}

                    {delivery.status === "In Transit" && (
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder={delivery.deliveryOTP}
                          value={otpInputs[delivery.id] || ""}
                          onChange={(e) =>
                            setOtpInputs((prev) => ({
                              ...prev,
                              [delivery.id]: e.target.value,
                            }))
                          }
                          className="w-32"
                        />
                        <Button
                          onClick={() => handleCompleteDelivery(delivery.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Delivery
                        </Button>
                      </div>
                    )}

                    {delivery.status === "Delivered" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Delivery Completed</span>
                      </div>
                    )}
                  </div>

                  {delivery.deliveryNotes && delivery.status === "Delivered" && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">Delivery Notes:</p>
                      <p>{delivery.deliveryNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Available Deliveries Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Deliveries</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Winter Clothing for Homeless Shelter</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-500 text-white">Available</Badge>
                  <Badge className="bg-yellow-500 text-white">Medium</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  NGO: City Shelter Network
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <p>
                    <span className="font-medium">Route:</span> Community Donation Center, NYC → Downtown Homeless
                    Shelter, NYC
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <p>
                    <span className="font-medium">Estimated Delivery:</span> 2024-01-28
                  </p>
                </div>

                <Button onClick={() => handlePledgeDelivery("new")} className="bg-blue-600 hover:bg-blue-700">
                  Pledge Delivery
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
