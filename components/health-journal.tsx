"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Trash2, CalendarIcon, Edit, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isSameDay } from "date-fns"
import { translations, Language } from "@/lib/translations"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define journal entry type
type JournalEntry = {
  id: string
  title: string
  content: string
  date: string // ISO string
  mood: "great" | "good" | "okay" | "bad" | "terrible"
  symptoms: string[]
}

interface HealthJournalProps {
  currentLanguage: Language
}

export default function HealthJournal({ currentLanguage }: HealthJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState<Omit<JournalEntry, "id">>({
    title: "",
    content: "",
    date: new Date().toISOString(),
    mood: "good",
    symptoms: [],
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [symptomInput, setSymptomInput] = useState("")
  const [editingEntry, setEditingEntry] = useState<string | null>(null)

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem("healthcare-journal")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  // Save entries to localStorage
  const saveEntries = (journalEntries: JournalEntry[]) => {
    localStorage.setItem("healthcare-journal", JSON.stringify(journalEntries))
    setEntries(journalEntries)
  }

  // Add new entry
  const addEntry = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      ...newEntry,
    }

    const updatedEntries = [...entries, entry]
    saveEntries(updatedEntries)
    setDialogOpen(false)
    setNewEntry({
      title: "",
      content: "",
      date: new Date().toISOString(),
      mood: "good",
      symptoms: [],
    })
    setSymptomInput("")
  }

  // Delete entry
  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    saveEntries(updatedEntries)
  }

  // Update entry
  const updateEntry = (id: string, updatedData: Partial<JournalEntry>) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, ...updatedData }
      }
      return entry
    })
    saveEntries(updatedEntries)
    setEditingEntry(null)
  }

  // Add symptom to new entry
  const addSymptom = () => {
    if (symptomInput.trim() && !newEntry.symptoms.includes(symptomInput.trim())) {
      setNewEntry({
        ...newEntry,
        symptoms: [...newEntry.symptoms, symptomInput.trim()],
      })
      setSymptomInput("")
    }
  }

  // Remove symptom from new entry
  const removeSymptom = (symptom: string) => {
    setNewEntry({
      ...newEntry,
      symptoms: newEntry.symptoms.filter((s) => s !== symptom),
    })
  }

  // Get entries by date
  const getEntriesByDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return isSameDay(entryDate, date)
    })
  }

  // Get mood emoji
  const getMoodEmoji = (mood: JournalEntry["mood"]) => {
    switch (mood) {
      case "great":
        return "😄"
      case "good":
        return "🙂"
      case "okay":
        return "😐"
      case "bad":
        return "😔"
      case "terrible":
        return "😣"
      default:
        return "🙂"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{translations.dashboard[currentLanguage].journal}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {translations.dashboard[currentLanguage].addEntry}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translations.dashboard[currentLanguage].addNewEntry}</DialogTitle>
              <DialogDescription>{translations.dashboard[currentLanguage].enterEntryDetails}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  {translations.dashboard[currentLanguage].title}
                </Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  {translations.dashboard[currentLanguage].content}
                </Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="col-span-3"
                  placeholder={translations.dashboard[currentLanguage].contentPlaceholder}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mood" className="text-right">
                  {translations.dashboard[currentLanguage].mood}
                </Label>
                <Select
                  value={newEntry.mood}
                  onValueChange={(value: JournalEntry["mood"]) => setNewEntry({ ...newEntry, mood: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={translations.dashboard[currentLanguage].selectMood} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">{translations.dashboard[currentLanguage].moodGreat}</SelectItem>
                    <SelectItem value="good">{translations.dashboard[currentLanguage].moodGood}</SelectItem>
                    <SelectItem value="okay">{translations.dashboard[currentLanguage].moodOkay}</SelectItem>
                    <SelectItem value="bad">{translations.dashboard[currentLanguage].moodBad}</SelectItem>
                    <SelectItem value="terrible">{translations.dashboard[currentLanguage].moodTerrible}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symptoms" className="text-right">
                  {translations.dashboard[currentLanguage].symptoms}
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input
                    id="symptoms"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder={translations.dashboard[currentLanguage].addSymptom}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSymptom()
                      }
                    }}
                  />
                  <Button type="button" onClick={addSymptom}>
                    {translations.dashboard[currentLanguage].add}
                  </Button>
                </div>
              </div>
              {newEntry.symptoms.length > 0 && (
                <div className="col-span-4 flex flex-wrap gap-2 mt-2">
                  {newEntry.symptoms.map((symptom) => (
                    <div key={symptom} className="bg-muted px-2 py-1 rounded-md flex items-center">
                      <span className="text-sm">{symptom}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeSymptom(symptom)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {translations.dashboard[currentLanguage].cancel}
              </Button>
              <Button onClick={addEntry} disabled={!newEntry.title || !newEntry.content}>
                {translations.dashboard[currentLanguage].addEntry}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{translations.dashboard[currentLanguage].allEntries}</TabsTrigger>
          <TabsTrigger value="calendar">{translations.dashboard[currentLanguage].calendarView}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>{translations.dashboard[currentLanguage].noJournalEntries}</p>
              </CardContent>
            </Card>
          ) : (
            entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <Card key={entry.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle>{entry.title}</CardTitle>
                        <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingEntry === entry.id ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateEntry(entry.id, { content: entry.content })}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="icon" onClick={() => setEditingEntry(entry.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                      {entry.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entry.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary">
                              {symptom}
                            </Badge>
                          ))}
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
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>{translations.dashboard[currentLanguage].pickDate}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-lg font-medium mb-2">
                    {translations.dashboard[currentLanguage].entriesFor} {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  {getEntriesByDate(selectedDate).length === 0 ? (
                    <p className="text-muted-foreground">{translations.dashboard[currentLanguage].noEntriesForDate}</p>
                  ) : (
                    <div className="space-y-4">
                      {getEntriesByDate(selectedDate).map((entry) => (
                        <Card key={entry.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <CardTitle>{entry.title}</CardTitle>
                                <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {editingEntry === entry.id ? (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateEntry(entry.id, { content: entry.content })}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="icon" onClick={() => setEditingEntry(entry.id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{entry.content}</p>
                              {entry.symptoms.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {entry.symptoms.map((symptom) => (
                                    <Badge key={symptom} variant="secondary">
                                      {symptom}
                                    </Badge>
                                  ))}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

