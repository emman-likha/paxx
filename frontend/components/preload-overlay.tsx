"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Shield } from "lucide-react"
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

    useEffect(() => {
        convergeRef.current = converge
    }, [converge])

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

        mat.opacity = Math.min(0.5, time * 0.25)

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
        particleColor: "#525252",
        halo: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 30%, transparent 60%)",
        titleColor: "rgba(255,255,255,0.95)",
        iconBg: "rgba(255,255,255,0.08)",
        iconColor: "rgba(255,255,255,0.9)",
        barTrackBg: "rgba(255,255,255,0.08)",
        barFillBg: "rgba(255,255,255,0.55)",
        barGlow: "0 0 12px rgba(255,255,255,0.15)",
        textColor: "rgba(255,255,255,0.45)",
        dotColor: "rgba(255,255,255,0.35)",
    },
    light: {
        bg: "#fafafa",
        particleColor: "#a1a1aa",
        halo: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.015) 30%, transparent 60%)",
        titleColor: "rgba(9,9,11,0.9)",
        iconBg: "rgba(9,9,11,0.06)",
        iconColor: "rgba(9,9,11,0.85)",
        barTrackBg: "rgba(9,9,11,0.08)",
        barFillBg: "rgba(9,9,11,0.4)",
        barGlow: "0 0 12px rgba(9,9,11,0.06)",
        textColor: "rgba(9,9,11,0.4)",
        dotColor: "rgba(9,9,11,0.25)",
    },
}

// ─── Preload Overlay ─────────────────────────────────────────────────────

const SEQUENCE = [
    "Establishing secure connection",
    "Deriving encryption keys",
    "Preparing your vault",
]

const TOTAL_DURATION = 3400
const STEP_INTERVAL = 850
const PRELOAD_SHOWN_KEY = "paxx-preload-shown"

export function PreloadOverlay() {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme !== "light"
    const t = isDark ? themes.dark : themes.light

    const [mounted, setMounted] = useState(false)
    const [dismissed, setDismissed] = useState(true)
    const [step, setStep] = useState(0)
    const [exiting, setExiting] = useState(false)
    const [converge, setConverge] = useState(false)

    useEffect(() => {
        setMounted(true)
        const isDismissed = !!sessionStorage.getItem(PRELOAD_SHOWN_KEY)
        setDismissed(isDismissed)

        if (!isDismissed) {
            sessionStorage.setItem(PRELOAD_SHOWN_KEY, "true")
        }
    }, [])

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

    if (!mounted || dismissed) return null

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
                    {/* Three.js particle field — pushed behind content */}
                    <div className="absolute inset-0 z-0">
                        <Canvas
                            camera={{ position: [0, 0, 12], fov: 75 }}
                            dpr={[1, 2]}
                            gl={{ alpha: true, antialias: true }}
                        >
                            <PreloadParticles converge={converge} particleColor={t.particleColor} />
                        </Canvas>
                    </div>

                    {/* Halo — dramatic glow behind the center content */}
                    <div
                        className="absolute inset-0 z-[1] pointer-events-none"
                        style={{ background: t.halo }}
                    />

                    {/* ── Center content ── */}
                    <AnimatePresence mode="wait">
                        {!exiting && (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.4 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                {/* Shield icon */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                    className="flex items-center justify-center rounded-2xl mb-6"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        backgroundColor: t.iconBg,
                                    }}
                                >
                                    <Shield
                                        className="size-7"
                                        style={{ color: t.iconColor }}
                                    />
                                </motion.div>

                                {/* Wordmark */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.1,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                    className="text-[2.75rem] sm:text-[3.5rem] font-bold tracking-tight"
                                    style={{
                                        color: t.titleColor,
                                        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                                    }}
                                >
                                    Paxx
                                </motion.h1>

                                {/* Progress bar */}
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0.8 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    transition={{ duration: 0.4, delay: 0.25 }}
                                    className="mt-8 rounded-full overflow-hidden"
                                    style={{
                                        width: 200,
                                        height: 3,
                                        backgroundColor: t.barTrackBg,
                                        boxShadow: t.barGlow,
                                    }}
                                >
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            backgroundColor: t.barFillBg,
                                        }}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: TOTAL_DURATION / 1000,
                                            ease: "linear",
                                        }}
                                    />
                                </motion.div>

                                {/* Status text */}
                                <div className="mt-6 h-5 flex items-center justify-center gap-2">
                                    {/* Pulsing dot */}
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{
                                            duration: 1.4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="inline-block rounded-full"
                                        style={{
                                            width: 5,
                                            height: 5,
                                            backgroundColor: t.dotColor,
                                        }}
                                    />
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={step}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.25 }}
                                            className="text-[13px] tracking-wide"
                                            style={{
                                                color: t.textColor,
                                                fontFamily: "var(--font-geist-mono), monospace",
                                            }}
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
