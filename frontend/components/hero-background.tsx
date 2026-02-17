"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function Particles({ count = 800 }) {
    const meshRef = useRef<THREE.Points>(null!)
    const { viewport } = useThree()

    // Store mouse position in a ref to bypass R3F's local mouse tracking
    // which can be blocked by pointer-events-none
    const mouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Map screen coordinates to normalized device coordinates (-1 to +1)
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // Create the object manually
    const points = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            // Concentrating particles more in the center area to avoid edges
            pos[i * 3] = (Math.random() - 0.5) * 18
            pos[i * 3 + 1] = (Math.random() - 0.5) * 14
            pos[i * 3 + 2] = (Math.random() - 0.5) * 5
        }
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))

        const mat = new THREE.PointsMaterial({
            size: 0.15,
            color: "#b1b0b0",
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
        })

        return new THREE.Points(geo, mat)
    }, [count])

    const initialPositions = useMemo(() => {
        return new Float32Array(points.geometry.attributes.position.array as Float32Array)
    }, [points])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const pos = points.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Constant drift + floating motion
            pos[i3] = initialPositions[i3] + Math.sin(time * 0.4 + initialPositions[i3]) * 0.5
            pos[i3 + 1] = initialPositions[i3 + 1] + Math.cos(time * 0.4 + initialPositions[i3 + 1]) * 0.5
            pos[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.2 + initialPositions[i3]) * 0.3

            // Mouse interaction
            const mx = (mouse.current.x * viewport.width) / 2
            const my = (mouse.current.y * viewport.height) / 2

            const dx = pos[i3] - mx
            const dy = pos[i3 + 1] - my
            const dist = Math.sqrt(dx * dx + dy * dy)

            const radius = 6
            if (dist < radius) {
                const force = (radius - dist) / radius
                pos[i3] += dx * force * 0.6
                pos[i3 + 1] += dy * force * 0.6
            } else {
                pos[i3] += (initialPositions[i3] - pos[i3]) * 0.02
                pos[i3 + 1] += (initialPositions[i3 + 1] - pos[i3 + 1]) * 0.02
            }
        }
        points.geometry.attributes.position.needsUpdate = true
    })

    return <primitive object={points} ref={meshRef} />
}

export function HeroBackground() {
    return (
        <div
            className="absolute inset-x-0 bottom-0 top-0 z-0 h-full w-full pointer-events-none overflow-hidden"
            style={{
                maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 12], fov: 75 }}
                dpr={[1, 2]}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={1.5} />
                <Particles />
            </Canvas>
        </div>
    )
}
