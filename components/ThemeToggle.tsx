'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800">
                <div className="w-5 h-5" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="group relative p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label="切换主题"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-45" />
            ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform group-hover:-rotate-12" />
            )}
        </button>
    )
}
