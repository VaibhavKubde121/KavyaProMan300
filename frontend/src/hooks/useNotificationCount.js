import { useEffect, useState } from 'react'

function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function getUnreadNotificationCount() {
  if (typeof window === 'undefined') {
    return 0
  }

  const raw = localStorage.getItem('notifications')
  if (!raw) {
    return 0
  }

  const notifications = safeJsonParse(raw, [])
  if (!Array.isArray(notifications)) {
    return 0
  }

  return notifications.reduce((count, item) => {
    if (!item || typeof item !== 'object') {
      return count
    }

    const hasReadFlag = Object.prototype.hasOwnProperty.call(item, 'read')
    const hasIsReadFlag = Object.prototype.hasOwnProperty.call(item, 'isRead')

    if (hasReadFlag || hasIsReadFlag) {
      const isRead = item.read === true || item.isRead === true
      return isRead ? count : count + 1
    }

    return count + 1
  }, 0)
}

export default function useNotificationCount() {
  const [count, setCount] = useState(() => getUnreadNotificationCount())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function refreshCount() {
      setCount(getUnreadNotificationCount())
    }

    const intervalId = window.setInterval(refreshCount, 3000)
    window.addEventListener('storage', refreshCount)
    window.addEventListener('focus', refreshCount)
    window.addEventListener('notifications-updated', refreshCount)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('storage', refreshCount)
      window.removeEventListener('focus', refreshCount)
      window.removeEventListener('notifications-updated', refreshCount)
    }
  }, [])

  return count
}
