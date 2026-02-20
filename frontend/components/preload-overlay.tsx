"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ─── Three.js Particles ───────────────────────────────────────────────────

function PreloadParticles({
    count = 600,
    converge = false,
    particleColor = "#a0a0a0",
}: {
    count?: number
    converge?: boolean
    particleColor?: string
}) {
    const meshRef = useRef<THREE.Points>(null!)
    const { viewport } = useThree()
    const mouse = useRef({ x: 0, y: 0 })
    const convergeRef = useRef(converge)
    const colorRef = useRef(particleColor)

    useEffect(() => {
        convergeRef.current = converge
    }, [converge])

    useEffect(() => {
        colorRef.current = particleColor
    }, [particleColor])

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const points = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20
            pos[i * 3 + 1] = (Math.random() - 0.5) * 16
            pos[i * 3 + 2] = (Math.random() - 0.5) * 6
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))

        const mat = new THREE.PointsMaterial({
            size: 0.12,
            color: particleColor,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
        })

        return new THREE.Points(geo, mat)
    }, [count, particleColor])

    const initialPositions = useMemo(() => {
        return new Float32Array(points.geometry.attributes.position.array as Float32Array)
    }, [points])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const pos = points.geometry.attributes.position.array as Float32Array
        const mat = points.material as THREE.PointsMaterial

        mat.opacity = Math.min(0.6, time * 0.3)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            if (convergeRef.current) {
                pos[i3] += (0 - pos[i3]) * 0.04
                pos[i3 + 1] += (0 - pos[i3 + 1]) * 0.04
                pos[i3 + 2] += (0 - pos[i3 + 2]) * 0.04
                mat.opacity = Math.max(0, mat.opacity - 0.003)
            } else {
                pos[i3] = initialPositions[i3] + Math.sin(time * 0.3 + initialPositions[i3]) * 0.6
                pos[i3 + 1] = initialPositions[i3 + 1] + Math.cos(time * 0.3 + initialPositions[i3 + 1]) * 0.6
                pos[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.15 + initialPositions[i3]) * 0.3

                const mx = (mouse.current.x * viewport.width) / 2
                const my = (mouse.current.y * viewport.height) / 2
                const dx = pos[i3] - mx
                const dy = pos[i3 + 1] - my
                const dist = Math.sqrt(dx * dx + dy * dy)
                const radius = 5
                if (dist < radius) {
                    const force = (radius - dist) / radius
                    pos[i3] += dx * force * 0.4
                    pos[i3 + 1] += dy * force * 0.4
                }
            }
        }
        points.geometry.attributes.position.needsUpdate = true
    })

    return <primitive object={points} ref={meshRef} />
}

// ─── Theme palettes ──────────────────────────────────────────────────────

const themes = {
    dark: {
        bg: "#09090b",
        particleColor: "#a0a0a0",
        glow: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 100%)",
        titleClass: "text-white/90",
        barTrack: "bg-white/[0.06]",
        barFill: "bg-white/30",
        textClass: "text-white/50",
    },
    light: {
        bg: "#fafafa",
        particleColor: "#71717a",
        glow: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,0.03) 0%, transparent 100%)",
        titleClass: "text-zinc-800",
        barTrack: "bg-zinc-900/[0.06]",
        barFill: "bg-zinc-900/25",
        textClass: "text-zinc-500",
    },
}

// ─── Preload Overlay ─────────────────────────────────────────────────────

const SEQUENCE = [
    "Establishing secure connection",
    "Deriving encryption keys",
    "Preparing your vault",
]

const TOTAL_DURATION = 3200
const STEP_INTERVAL = 800
const PRELOAD_SHOWN_KEY = "paxx-preload-shown"

export function PreloadOverlay() {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme !== "light"
    const t = isDark ? themes.dark : themes.light

    const [dismissed, setDismissed] = useState(() => {
        if (typeof window === "undefined") return true
        return !!sessionStorage.getItem(PRELOAD_SHOWN_KEY)
    })
    const [step, setStep] = useState(0)
    const [exiting, setExiting] = useState(false)
    const [converge, setConverge] = useState(false)

    useEffect(() => {
        if (!dismissed) {
            sessionStorage.setItem(PRELOAD_SHOWN_KEY, "true")
        }
    }, [dismissed])

    useEffect(() => {
        if (dismissed) return

        const stepTimers = SEQUENCE.map((_, i) =>
            setTimeout(() => setStep(i), i * STEP_INTERVAL)
        )

        const exitTimer = setTimeout(() => {
            setExiting(true)
            setConverge(true)
        }, TOTAL_DURATION - 600)

        const dismissTimer = setTimeout(() => {
            setDismissed(true)
        }, TOTAL_DURATION)

        return () => {
            stepTimers.forEach(clearTimeout)
            clearTimeout(exitTimer)
            clearTimeout(dismissTimer)
        }
    }, [dismissed])

    if (dismissed) return null

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    key="preload"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: t.bg }}
                >
                    {/* Three.js particle field */}
                    <div className="absolute inset-0">
                        <Canvas
                            camera={{ position: [0, 0, 12], fov: 75 }}
                            dpr={[1, 2]}
                            gl={{ alpha: true, antialias: true }}
                        >
                            <PreloadParticles converge={converge} particleColor={t.particleColor} />
                        </Canvas>
                    </div>

                    {/* Subtle radial glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: t.glow }}
                    />

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {!exiting && (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.4 }}
                                className="relative z-10 flex flex-col items-center gap-8"
                            >
                                {/* Paxx wordmark */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className={`text-[2rem] font-medium tracking-[0.3em] uppercase ${t.titleClass}`}
                                    style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                                >
                                    Paxx
                                </motion.h1>

                                {/* Progress bar */}
                                <div className={`w-48 h-px ${t.barTrack} rounded-full overflow-hidden`}>
                                    <motion.div
                                        className={`h-full ${t.barFill}`}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: TOTAL_DURATION / 1000,
                                            ease: "linear",
                                        }}
                                    />
                                </div>

                                {/* Rotating status text */}
                                <div className="h-5 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={step}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 0.5, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.3 }}
                                            className={`text-xs tracking-widest uppercase ${t.textClass}`}
                                            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                                        >
                                            {SEQUENCE[step]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
