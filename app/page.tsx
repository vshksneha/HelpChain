"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Shield, Users, TrendingUp, ArrowRight, Globe, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDonations: 0,
    aidPackagesDelivered: 0,
    activeVolunteers: 0,
    ngoPartners: 0,
  })

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      setStats({
        totalDonations: 125000,
        aidPackagesDelivered: 847,
        activeVolunteers: 234,
        ngoPartners: 45,
      })
    }

    const timer = setTimeout(animateStats, 500)
    return () => clearTimeout(timer)
  }, [])

  const featuredAidPackages = [
    {
      id: 1,
      title: "Emergency Food Relief for Flood Victims",
      ngo: "Global Relief Foundation",
      location: "Bangladesh",
      urgency: "Critical",
      fundingGoal: 5000,
      currentFunding: 3200,
      itemType: "Food",
      beneficiaries: 150,
      image: "/placeholder-kwai0.png",
    },
    {
      id: 2,
      title: "Medical Supplies for Rural Clinic",
      ngo: "Health for All",
      location: "Kenya",
      urgency: "High",
      fundingGoal: 8000,
      currentFunding: 6400,
      itemType: "Medicine",
      beneficiaries: 500,
      image: "/placeholder-5y8sr.png",
    },
    {
      id: 3,
      title: "Winter Clothing for Homeless Shelter",
      ngo: "Warmth Initiative",
      location: "Ukraine",
      urgency: "High",
      fundingGoal: 3000,
      currentFunding: 1800,
      itemType: "Clothing",
      beneficiaries: 80,
      image: "/winter-clothing-blankets.png",
    },
  ]

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-bold text-foreground">HelpChain</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#impact" className="text-muted-foreground hover:text-foreground transition-colors">
                Impact
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/auth/register")}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Transparent Aid Distribution
              <span className="block text-primary">Powered by Blockchain</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect NGOs, donors, and volunteers in a transparent ecosystem where every donation is tracked from
              creation to delivery, ensuring maximum impact and accountability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => router.push("/auth/register?role=donor")}>
                Start Donating
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/auth/register?role=ngo")}>
                Join as NGO
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/auth/register?role=volunteer")}>
                Become Volunteer
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">${stats.totalDonations.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Donations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.aidPackagesDelivered}</div>
                <div className="text-sm text-muted-foreground">Packages Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.activeVolunteers}</div>
                <div className="text-sm text-muted-foreground">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.ngoPartners}</div>
                <div className="text-sm text-muted-foreground">NGO Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Aid Packages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Urgent Aid Packages</h2>
            <p className="text-lg text-muted-foreground">Help us deliver critical aid to those who need it most</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAidPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img src={pkg.image || "/placeholder.svg"} alt={pkg.title} className="w-full h-full object-cover" />
                  <Badge className={`absolute top-3 right-3 ${getUrgencyColor(pkg.urgency)}`}>{pkg.urgency}</Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{pkg.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {pkg.location} • {pkg.ngo}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        ${pkg.currentFunding.toLocaleString()} / ${pkg.fundingGoal.toLocaleString()}
                      </span>
                    </div>

                    <Progress value={(pkg.currentFunding / pkg.fundingGoal) * 100} className="h-2" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{pkg.beneficiaries} beneficiaries</span>
                      <Badge variant="outline">{pkg.itemType}</Badge>
                    </div>

                    <Button className="w-full" onClick={() => router.push(`/aid-packages/${pkg.id}`)}>
                      Donate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => router.push("/aid-packages")}>
              View All Aid Packages
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">How HelpChain Works</h2>
            <p className="text-lg text-muted-foreground">Transparent aid distribution in four simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">NGOs Create Requests</h3>
              <p className="text-muted-foreground">
                Verified NGOs create detailed aid package requests with specific needs and delivery locations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Donors Fund Packages</h3>
              <p className="text-muted-foreground">
                Donors browse and fund aid packages, with all transactions recorded on the blockchain.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-chart-4" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Volunteers Deliver</h3>
              <p className="text-muted-foreground">
                Verified volunteers pledge to deliver packages and update status throughout the journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Impact Verified</h3>
              <p className="text-muted-foreground">
                Delivery confirmation with proof creates an immutable record of successful aid distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Built on Trust & Transparency</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Blockchain Verification</h3>
                    <p className="text-muted-foreground">
                      Every donation and delivery is recorded on the blockchain, creating an immutable audit trail.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Verified Participants</h3>
                    <p className="text-muted-foreground">
                      All NGOs and volunteers undergo verification to ensure legitimacy and accountability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-chart-4 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Real-time Tracking</h3>
                    <p className="text-muted-foreground">
                      Track your donation's journey from funding to final delivery with real-time updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img src="/blockchain-transparency-diagram.png" alt="Blockchain transparency" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-serif font-bold text-foreground">HelpChain</span>
              </div>
              <p className="text-muted-foreground">
                Transparent humanitarian aid distribution powered by blockchain technology.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/aid-packages" className="hover:text-foreground transition-colors">
                    Browse Aid Packages
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register?role=donor" className="hover:text-foreground transition-colors">
                    Become a Donor
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register?role=volunteer" className="hover:text-foreground transition-colors">
                    Join as Volunteer
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register?role=ngo" className="hover:text-foreground transition-colors">
                    NGO Partnership
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 HelpChain. All rights reserved. Built with transparency and trust.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
