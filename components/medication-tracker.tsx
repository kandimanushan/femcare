"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Trash2, Check, X, Clock, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { translations, Language } from "@/lib/translations"

// Define medication type
type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  time: string
  notes: string
  taken: boolean[]
}

interface MedicationTrackerProps {
  currentLanguage: Language
}

export default function MedicationTracker({ currentLanguage }: MedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMedication, setNewMedication] = useState<Omit<Medication, "id" | "taken">>({
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
    notes: "",
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())

  // Load medications from localStorage
  useEffect(() => {
    const savedMedications = localStorage.getItem("healthcareMedications")
    if (savedMedications) {
      setMedications(JSON.parse(savedMedications))
    }
  }, [])

  // Save medications to localStorage
  const saveMedications = (meds: Medication[]) => {
    localStorage.setItem("healthcareMedications", JSON.stringify(meds))
    setMedications(meds)
  }

  // Add new medication
  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      ...newMedication,
      taken: Array(
        Number.parseInt(newMedication.frequency === "daily" ? "1" : newMedication.frequency.split(" ")[0]),
      ).fill(false),
    }

    const updatedMedications = [...medications, newMed]
    saveMedications(updatedMedications)
    setDialogOpen(false)
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      notes: "",
    })
  }

  // Delete medication
  const deleteMedication = (id: string) => {
    const updatedMedications = medications.filter((med) => med.id !== id)
    saveMedications(updatedMedications)
  }

  // Toggle medication taken status
  const toggleMedicationStatus = (medId: string, index: number) => {
    const updatedMedications = medications.map((med) => {
      if (med.id === medId) {
        const updatedTaken = [...med.taken]
        updatedTaken[index] = !updatedTaken[index]
        return { ...med, taken: updatedTaken }
      }
      return med
    })
    saveMedications(updatedMedications)
  }

  // Calculate progress for each medication
  const calculateProgress = (taken: boolean[]) => {
    if (taken.length === 0) return 0
    const takenCount = taken.filter((status) => status).length
    return (takenCount / taken.length) * 100
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{translations.dashboard[currentLanguage].medications}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations.dashboard[currentLanguage].addMedication}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translations.dashboard[currentLanguage].addNewMedication}</DialogTitle>
              <DialogDescription>{translations.dashboard[currentLanguage].enterMedicationDetails}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {translations.dashboard[currentLanguage].medicationName}
                </Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  className="col-span-3"
                  placeholder={translations.dashboard[currentLanguage].medicationNamePlaceholder}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  {translations.dashboard[currentLanguage].dosage}
                </Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="col-span-3"
                  placeholder={translations.dashboard[currentLanguage].dosagePlaceholder}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  {translations.dashboard[currentLanguage].frequency}
                </Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={translations.dashboard[currentLanguage].selectFrequency} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{translations.dashboard[currentLanguage].daily}</SelectItem>
                    <SelectItem value="weekly">{translations.dashboard[currentLanguage].weekly}</SelectItem>
                    <SelectItem value="monthly">{translations.dashboard[currentLanguage].monthly}</SelectItem>
                    <SelectItem value="asNeeded">{translations.dashboard[currentLanguage].asNeeded}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  {translations.dashboard[currentLanguage].time}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  {translations.dashboard[currentLanguage].notes}
                </Label>
                <Input
                  id="notes"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                  className="col-span-3"
                  placeholder={translations.dashboard[currentLanguage].notesPlaceholder}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {translations.dashboard[currentLanguage].cancel}
              </Button>
              <Button onClick={addMedication} disabled={!newMedication.name || !newMedication.dosage}>
                {translations.dashboard[currentLanguage].addMedication}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">{translations.dashboard[currentLanguage].todayMedications}</TabsTrigger>
          <TabsTrigger value="all">{translations.dashboard[currentLanguage].allMedications}</TabsTrigger>
          <TabsTrigger value="calendar">{translations.dashboard[currentLanguage].calendarView}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-4">
          {medications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{translations.dashboard[currentLanguage].noMedicationsToday}</p>
              </CardContent>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{med.name}</CardTitle>
                      <CardDescription>
                        {med.dosage} - {med.frequency}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMedication(med.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{translations.dashboard[currentLanguage].dosage}</span>
                      <span className="text-sm font-medium">{med.dosage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{translations.dashboard[currentLanguage].time}</span>
                      <span className="text-sm font-medium">{med.time}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{translations.dashboard[currentLanguage].frequency}</span>
                        <span className="font-medium">{med.frequency}</span>
                      </div>
                      <Progress value={calculateProgress(med.taken)} className="h-2" />
                    </div>
                    {med.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">{translations.dashboard[currentLanguage].notes}:</span> {med.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {medications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{translations.dashboard[currentLanguage].noMedications}</p>
              </CardContent>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{med.name}</CardTitle>
                      <CardDescription>
                        {med.dosage} - {med.frequency}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMedication(med.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{translations.dashboard[currentLanguage].dosage}</span>
                      <span className="text-sm font-medium">{med.dosage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{translations.dashboard[currentLanguage].time}</span>
                      <span className="text-sm font-medium">{med.time}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{translations.dashboard[currentLanguage].frequency}</span>
                        <span className="font-medium">{med.frequency}</span>
                      </div>
                      <Progress value={calculateProgress(med.taken)} className="h-2" />
                    </div>
                    {med.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">{translations.dashboard[currentLanguage].notes}:</span> {med.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{translations.dashboard[currentLanguage].medications}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  {translations.dashboard[currentLanguage].medications}
                </h3>
                {medications.length === 0 ? (
                  <p className="text-muted-foreground">{translations.dashboard[currentLanguage].noMedications}</p>
                ) : (
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                        <Badge variant={med.taken[0] ? "default" : "secondary"}>
                          {med.taken[0] ? translations.dashboard[currentLanguage].add : translations.dashboard[currentLanguage].cancel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

