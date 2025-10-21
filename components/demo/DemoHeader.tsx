import { AlertTriangle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface DemoHeaderProps {
  title: string
  description: string
}

export default function DemoHeader({ title, description }: DemoHeaderProps) {
  return (
    <div className="mb-6">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>DEMO MODE</strong> - {description}
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/" className="flex items-center gap-2">
                Exit Demo <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">{title}</h1>
    </div>
  )
}
