
'use client'

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  subDays,
  startOfDay,
  endOfDay,
  format,
  isToday,
  isYesterday,
} from 'date-fns'
import { Footprints, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

interface StepStatsDialogProps {
  token: string
}

interface DailyStepData {
  date: string
  steps: number
  day: string
}

export function StepStatsDialog({ token }: StepStatsDialogProps) {
  const [data, setData] = useState<DailyStepData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeeklySteps = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const now = new Date()
    const startTime = startOfDay(subDays(now, 6)).getTime()
    const endTime = endOfDay(now).getTime()

    try {
      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.step_count.delta',
                dataSourceId:
                  'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 24 hours in millis
            startTimeMillis: startTime,
            endTimeMillis: endTime,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error.message || 'Failed to fetch steps.')
      }

      const result = await response.json()
      const buckets = result.bucket

      const weeklyData = Array.from({ length: 7 }).map((_, i) => {
        const date = startOfDay(subDays(now, 6 - i))
        const bucket = buckets.find((b: any) => {
          const bucketDate = new Date(parseInt(b.startTimeMillis))
          return startOfDay(bucketDate).getTime() === date.getTime()
        })

        let dayLabel = format(date, 'E') // 'Mon', 'Tue', etc.
        if (isToday(date)) dayLabel = 'Today'
        if (isYesterday(date)) dayLabel = 'Yest'

        let steps = 0
        if (bucket && bucket.dataset[0].point.length > 0) {
          steps = bucket.dataset[0].point[0].value[0].intVal
        }

        return {
          date: format(date, 'yyyy-MM-dd'),
          steps: steps,
          day: dayLabel,
        }
      })

      setData(weeklyData)
    } catch (err: any) {
      setError('Could not load weekly step data.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchWeeklySteps()
  }, [fetchWeeklySteps])

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="font-headline flex items-center gap-2">
          <Footprints /> Weekly Step Summary
        </DialogTitle>
        <DialogDescription>
          Your daily step counts for the last 7 days.
        </DialogDescription>
      </DialogHeader>
      <div className="h-[300px] w-full pt-4">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex h-full w-full items-center justify-center text-destructive">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `${(value as number) / 1000}k`
                }
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value) => [
                  `${(value as number).toLocaleString()} steps`,
                  null,
                ]}
                labelFormatter={(label) => {
                  const date = data.find(d => d.day === label)?.date;
                  if (!date) return label;
                  return format(new Date(date), 'eeee, MMMM d')
                }}
              />
              <Bar
                dataKey="steps"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DialogContent>
  )
}
