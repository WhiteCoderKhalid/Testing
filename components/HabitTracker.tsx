'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, PlusCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

interface Habit {
  id: string
  name: string
  completions: { [key: string]: boolean }
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    const storedHabits = localStorage.getItem('habits')
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (newHabit.trim() !== '') {
      setHabits([...habits, { id: Date.now().toString(), name: newHabit, completions: {} }])
      setNewHabit('')
    }
  }

  const toggleHabit = (habitId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions }
        newCompletions[dateString] = !newCompletions[dateString]
        return { ...habit, completions: newCompletions }
      }
      return habit
    }))
  }

  const renderCalendar = (habit: Habit) => {
    const monthStart = startOfWeek(currentMonth, { weekStartsOn: 1 })
    const monthEnd = endOfWeek(addWeeks(monthStart, 5), { weekStartsOn: 1 })
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addWeeks(prev, -4))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addWeeks(prev, 4))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center font-medium text-sm py-1">
              {day}
            </div>
          ))}
          {monthDays.map(day => (
            <div
              key={day.toISOString()}
              className={`text-center p-1 ${
                isSameDay(day, new Date()) ? 'bg-accent' : 'bg-background'
              }`}
            >
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  habit.completions[format(day, 'yyyy-MM-dd')]
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleHabit(habit.id, day)}
              >
                {format(day, 'd')}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWeekView = (habit: Habit) => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(prev => addWeeks(prev, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-8 gap-2">
          <div className="font-medium">Habit</div>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center font-medium">{day}</div>
          ))}
          <div>{habit.name}</div>
          {weekDays.map(day => {
            const dateString = format(day, 'yyyy-MM-dd')
            return (
              <div key={dateString} className="flex justify-center">
                <Checkbox
                  checked={habit.completions[dateString] || false}
                  onCheckedChange={() => toggleHabit(habit.id, day)}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <nav className="w-64 border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Habit Tracker</h1>
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex mb-4">
            <Input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Enter a new habit"
              className="mr-2"
            />
            <Button onClick={addHabit}>Add Habit</Button>
          </div>

          {habits.map(habit => (
            <Card key={habit.id} className="mb-4">
              <CardHeader>
                <CardTitle>{habit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="week">
                  <TabsList>
                    <TabsTrigger value="week">Week View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="week">
                    {renderWeekView(habit)}
                  </TabsContent>
                  <TabsContent value="calendar">
                    {renderCalendar(habit)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}