"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { translations, Language } from "@/lib/translations"

type PeriodData = {
  date: Date
  flow: "light" | "medium" | "heavy"
  symptoms: string[]
  mood: "happy" | "neutral" | "sad"
  notes: string
}

interface PeriodTrackerProps {
  currentLanguage: Language
}

export default function PeriodTracker({ currentLanguage }: PeriodTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [periodData, setPeriodData] = useState<PeriodData[]>([])
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">("neutral")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem("period-tracker-data")
    if (savedData) {
      setPeriodData(JSON.parse(savedData))
    }
  }, [])

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("period-tracker-data", JSON.stringify(periodData))
  }, [periodData])

  const handleSaveEntry = () => {
    if (!selectedDate) return

    const newEntry: PeriodData = {
      date: selectedDate,
      flow,
      symptoms,
      mood,
      notes,
    }

    setPeriodData((prev) => {
      const existingIndex = prev.findIndex(
        (entry) => entry.date.toDateString() === selectedDate.toDateString()
      )
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newEntry
        return updated
      }
      return [...prev, newEntry]
    })

    // Reset form
    setFlow("medium")
    setSymptoms([])
    setMood("neutral")
    setNotes("")
  }

  const getFlowColor = (flow: "light" | "medium" | "heavy") => {
    switch (flow) {
      case "light":
        return "#FFB6C1" // Light pink
      case "medium":
        return "#FF69B4" // Medium pink
      case "heavy":
        return "#FF1493" // Deep pink
      default:
        return "#FFB6C1"
    }
  }

  const getMoodEmoji = (mood: "happy" | "neutral" | "sad") => {
    switch (mood) {
      case "happy":
        return "😊"
      case "neutral":
        return "😐"
      case "sad":
        return "😔"
      default:
        return "😐"
    }
  }

  // Prepare data for the chart
  const chartData = periodData.map((entry) => ({
    date: entry.date.toLocaleDateString(),
    flow: entry.flow === "light" ? 1 : entry.flow === "medium" ? 2 : 3,
    mood: entry.mood === "happy" ? 3 : entry.mood === "neutral" ? 2 : 1,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar and Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>{translations.dashboard[currentLanguage].trackPeriod}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{translations.dashboard[currentLanguage].flowIntensity}</Label>
                <Select value={flow} onValueChange={(value: "light" | "medium" | "heavy") => setFlow(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{translations.dashboard[currentLanguage].flowLight}</SelectItem>
                    <SelectItem value="medium">{translations.dashboard[currentLanguage].flowMedium}</SelectItem>
                    <SelectItem value="heavy">{translations.dashboard[currentLanguage].flowHeavy}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{translations.dashboard[currentLanguage].symptoms}</Label>
                <Select
                  value={symptoms.join(",")}
                  onValueChange={(value) => setSymptoms(value.split(",").filter(Boolean))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cramps">{translations.dashboard[currentLanguage].symptomCramps}</SelectItem>
                    <SelectItem value="headache">{translations.dashboard[currentLanguage].symptomHeadache}</SelectItem>
                    <SelectItem value="bloating">{translations.dashboard[currentLanguage].symptomBloating}</SelectItem>
                    <SelectItem value="fatigue">{translations.dashboard[currentLanguage].symptomFatigue}</SelectItem>
                    <SelectItem value="mood swings">{translations.dashboard[currentLanguage].symptomMoodSwings}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{translations.dashboard[currentLanguage].mood}</Label>
                <Select value={mood} onValueChange={(value: "happy" | "neutral" | "sad") => setMood(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">{translations.dashboard[currentLanguage].moodHappy}</SelectItem>
                    <SelectItem value="neutral">{translations.dashboard[currentLanguage].moodNeutral}</SelectItem>
                    <SelectItem value="sad">{translations.dashboard[currentLanguage].moodSad}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{translations.dashboard[currentLanguage].notes}</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={translations.dashboard[currentLanguage].notesPlaceholder}
                />
              </div>

              <Button onClick={handleSaveEntry} className="w-full">
                {translations.dashboard[currentLanguage].saveEntry}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics and Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Period Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="flow"
                    stroke="#FF69B4"
                    name="Flow Intensity"
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#FFB6C1"
                    name="Mood"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Cycle Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">28 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Period Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">5 days</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>{translations.dashboard[currentLanguage].recentEntries}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {periodData
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{entry.date.toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {translations.dashboard[currentLanguage].flow}: {entry.flow} • {translations.dashboard[currentLanguage].mood}: {getMoodEmoji(entry.mood)}
                    </p>
                    {entry.symptoms.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {translations.dashboard[currentLanguage].symptoms}: {entry.symptoms.join(", ")}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getFlowColor(entry.flow) }}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 