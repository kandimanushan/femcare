"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { translations } from "@/lib/translations"
import { Language } from "@/lib/translations"

interface HealthMetricsChartProps {
  currentLanguage: Language
}

interface WeightData {
  date: string
  value: number
}

interface BloodPressureData {
  date: string
  systolic: number
  diastolic: number
}

interface GlucoseData {
  date: string
  value: number
}

export default function HealthMetricsChart({ currentLanguage }: HealthMetricsChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [metric, setMetric] = useState("weight")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMetric, setNewMetric] = useState({
    type: "weight",
    value: "",
    systolic: "",
    diastolic: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  // State for user metrics
  const [weightData, setWeightData] = useState<WeightData[]>([])
  const [bpData, setBpData] = useState<BloodPressureData[]>([])
  const [glucoseData, setGlucoseData] = useState<GlucoseData[]>([])

  useEffect(() => {
    setMounted(true)

    // Load data from localStorage
    const savedWeightData = localStorage.getItem("healthcareWeightData")
    if (savedWeightData) {
      setWeightData(JSON.parse(savedWeightData))
    }

    const savedBpData = localStorage.getItem("healthcareBpData")
    if (savedBpData) {
      setBpData(JSON.parse(savedBpData))
    }

    const savedGlucoseData = localStorage.getItem("healthcareGlucoseData")
    if (savedGlucoseData) {
      setGlucoseData(JSON.parse(savedGlucoseData))
    }
  }, [])

  const addMetric = () => {
    const date = format(new Date(newMetric.date), "MMM d")

    if (newMetric.type === "weight" && newMetric.value) {
      const newData = [...weightData, { date, value: Number.parseFloat(newMetric.value) }]
      setWeightData(newData)
      localStorage.setItem("healthcareWeightData", JSON.stringify(newData))
    } else if (newMetric.type === "bloodPressure" && newMetric.systolic && newMetric.diastolic) {
      const newData = [
        ...bpData,
        {
          date,
          systolic: Number.parseFloat(newMetric.systolic),
          diastolic: Number.parseFloat(newMetric.diastolic),
        },
      ]
      setBpData(newData)
      localStorage.setItem("healthcareBpData", JSON.stringify(newData))
    } else if (newMetric.type === "glucose" && newMetric.value) {
      const newData = [...glucoseData, { date, value: Number.parseFloat(newMetric.value) }]
      setGlucoseData(newData)
      localStorage.setItem("healthcareGlucoseData", JSON.stringify(newData))
    }

    setDialogOpen(false)
    setNewMetric({
      type: "weight",
      value: "",
      systolic: "",
      diastolic: "",
      date: format(new Date(), "yyyy-MM-dd"),
    })
  }

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center">Loading chart...</div>
  }

  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#333333" : "#e5e5e5"

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{translations.dashboard[currentLanguage].healthMetrics}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">{translations.dashboard[currentLanguage].metricWeight}</SelectItem>
                <SelectItem value="bloodPressure">{translations.dashboard[currentLanguage].metricBloodPressure}</SelectItem>
                <SelectItem value="heartRate">{translations.dashboard[currentLanguage].metricHeartRate}</SelectItem>
                <SelectItem value="temperature">{translations.dashboard[currentLanguage].metricTemperature}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setDialogOpen(true)}>
              {translations.dashboard[currentLanguage].addDataPoint}
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {metric === "weight" ? (
                weightData.length > 0 ? (
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" stroke={textColor} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis stroke={textColor} domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#333" : "#fff",
                        color: textColor,
                        border: `1px solid ${gridColor}`,
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Weight (kg)" stroke="#2563eb" activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">{translations.dashboard[currentLanguage].noWeightDataAvailable}</p>
                  </div>
                )
              ) : metric === "bloodPressure" ? (
                bpData.length > 0 ? (
                  <LineChart data={bpData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" stroke={textColor} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis stroke={textColor} domain={["dataMin - 10", "dataMax + 10"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#333" : "#fff",
                        color: textColor,
                        border: `1px solid ${gridColor}`,
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">{translations.dashboard[currentLanguage].noBloodPressureDataAvailable}</p>
                  </div>
                )
              ) : glucoseData.length > 0 ? (
                <LineChart data={glucoseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis stroke={textColor} domain={["dataMin - 10", "dataMax + 10"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#333" : "#fff",
                      color: textColor,
                      border: `1px solid ${gridColor}`,
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Glucose (mg/dL)" stroke="#10b981" activeDot={{ r: 8 }} />
                </LineChart>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">{translations.dashboard[currentLanguage].noGlucoseDataAvailable}</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.dashboard[currentLanguage].addDataPoint}</DialogTitle>
            <DialogDescription>
              {translations.dashboard[currentLanguage].enterMetricValue}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{translations.dashboard[currentLanguage].value}</Label>
              <Input
                type="number"
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                placeholder={translations.dashboard[currentLanguage].enterValue}
              />
            </div>
            <div className="space-y-2">
              <Label>{translations.dashboard[currentLanguage].date}</Label>
              <Input
                type="date"
                value={newMetric.date}
                onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {translations.dashboard[currentLanguage].cancel}
            </Button>
            <Button onClick={addMetric}>{translations.dashboard[currentLanguage].add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

