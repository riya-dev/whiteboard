import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, CheckSquare, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-light text-foreground text-balance">Your minimal planning space</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            A beautiful, airy dashboard to plan your week, track your goals, and build lasting disciplines.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/auth/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border bg-transparent">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Weekly planning</h3>
            <p className="text-sm text-muted-foreground">
              Three focused goals per day, organized beautifully across your week
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Daily goals</h3>
            <p className="text-sm text-muted-foreground">
              Simple, minimal cards that feel like your favorite whiteboard
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Habit tracking</h3>
            <p className="text-sm text-muted-foreground">
              GitHub-style heatmaps to visualize your consistency over time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
