'use client'

import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
    src: string
    type: string
    onEvent?: (event: string, data?: any) => void
}

export default function VideoPlayer({ src, type, onEvent }: VideoPlayerProps) {
    const videoRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const initialized = useRef(false)

    useEffect(() => {
        // Only initialize once
        if (initialized.current || !videoRef.current) return
        initialized.current = true

        const videoElement = document.createElement("video-js")
        videoElement.classList.add('vjs-big-play-centered')
        videoRef.current.appendChild(videoElement)

        const player = playerRef.current = videojs(videoElement, {
            controls: true,
            responsive: true,
            fluid: true,
            fill: true,
            sources: [{
                src,
                type: type === 'application/x-mpegURL' ? 'application/x-mpegURL' : 'video/mp4'
            }]
        }, () => {
            console.log('✅ Video player initialized')

            // Event handlers
            player.on('error', () => {
                const error = player.error()
                console.error('❌ VIDEO ERROR:', error)
            })

            player.on('play', () => onEvent?.('VIDEO_PLAY', { currentTime: player.currentTime() }))
            player.on('pause', () => onEvent?.('VIDEO_PAUSE', { currentTime: player.currentTime() }))
            player.on('ended', () => onEvent?.('VIDEO_END', { duration: player.duration() }))

            // Track progress
            let tracked = { 25: false, 50: false, 75: false }
            player.on('timeupdate', () => {
                if (!player) return
                const duration = player.duration()
                if (!duration) return
                // @ts-ignore
                const percent = (player.currentTime() / duration) * 100
                if (percent > 25 && !tracked[25]) {
                    onEvent?.('VIDEO_PROGRESS', { percent: 25 })
                    tracked[25] = true
                }
                if (percent > 50 && !tracked[50]) {
                    onEvent?.('VIDEO_PROGRESS', { percent: 50 })
                    tracked[50] = true
                }
                if (percent > 75 && !tracked[75]) {
                    onEvent?.('VIDEO_PROGRESS', { percent: 75 })
                    tracked[75] = true
                }
            })
        })

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose()
                playerRef.current = null
            }
            initialized.current = false
        }
    }, []) // Empty dependency array - only run once

    // Update source when src changes without reinitializing
    useEffect(() => {
        if (playerRef.current && !playerRef.current.isDisposed()) {
            playerRef.current.src({
                src,
                type: type === 'application/x-mpegURL' ? 'application/x-mpegURL' : 'video/mp4'
            })
        }
    }, [src, type])

    return (
        <div data-vjs-player className="w-full min-h-full flex items-center justify-center">
            <div ref={videoRef} className="w-full" />
        </div>
    )
}
