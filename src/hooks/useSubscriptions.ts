'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Subscription } from '@/types'
import { addSubscription, updateSubscription, deleteSubscription, getAllSubscriptions, getActiveSubscriptions } from '@/lib/db'
import { addDays, isWithinInterval, parseISO } from 'date-fns'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getAllSubscriptions()
    setSubscriptions(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (s: Omit<Subscription, 'id' | 'createdAt'>) => {
    await addSubscription(s)
    await load()
  }, [load])

  const update = useCallback(async (id: number, changes: Partial<Subscription>) => {
    await updateSubscription(id, changes)
    await load()
  }, [load])

  const remove = useCallback(async (id: number) => {
    await deleteSubscription(id)
    await load()
  }, [load])

  const activeSubscriptions = subscriptions.filter(s => s.active)
  const inactiveSubscriptions = subscriptions.filter(s => !s.active)

  const upcomingBills = activeSubscriptions.filter(s => {
    const today = new Date()
    const next30 = addDays(today, 30)
    const billingDate = parseISO(s.nextBillingDate)
    return isWithinInterval(billingDate, { start: today, end: next30 })
  })

  return {
    subscriptions,
    activeSubscriptions,
    inactiveSubscriptions,
    upcomingBills,
    loading,
    add,
    update,
    remove,
    reload: load,
  }
}

export function useUpcomingBills() {
  const { upcomingBills, loading } = useSubscriptions()
  return { upcomingBills, loading }
}
