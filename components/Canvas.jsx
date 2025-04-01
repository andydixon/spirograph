import React, { useRef, useEffect, useCallback } from 'react';
import styles from '../styles/Home.module.css';

export default function Canvas({ pointsToDraw, params, isDrawing, setIsDrawing }) {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const currentPointIndex = useRef(0);
    const lastTime = useRef(null);
    const drawingComplete = useRef(false);

    const animate = useCallback((timestamp) => {
        if (!lastTime.current) lastTime.current = timestamp;
        const deltaTime = timestamp - lastTime.current;
        lastTime.current = timestamp;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = params.lineWidth;

        if (!pointsToDraw || !pointsToDraw.length || drawingComplete.current) {
            return;
        }

        const steps = Math.max(1, Math.floor(deltaTime / params.speed));

        if (currentPointIndex.current < pointsToDraw[0].length - 1) {
            for (let k = 0; k < steps && currentPointIndex.current < pointsToDraw[0].length - 1; k++) {
                currentPointIndex.current++;
                for (let i = 0; i < pointsToDraw.length; i++) {
                    const p1 = pointsToDraw[i][currentPointIndex.current - 1];
                    const p2 = pointsToDraw[i][currentPointIndex.current];
                    if (p1 && p2) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x + canvas.width / 2, p1.y + canvas.height / 2);
                        ctx.lineTo(p2.x + canvas.width / 2, p2.y + canvas.height / 2);
                        ctx.strokeStyle = params.penColors[i];
                        ctx.stroke();
                    }
                }
            }
            animationFrameId.current = requestAnimationFrame(animate);
        } else {
            drawingComplete.current = true;
            setIsDrawing(false); // Signal parent that drawing is done
        }
    }, [pointsToDraw, params]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Note: Redrawing a complex image on resize is a non-trivial task.
            // For simplicity, the canvas will be cleared on resize.
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        if (isDrawing && pointsToDraw) {
            drawingComplete.current = false;
            currentPointIndex.current = 0;
            lastTime.current = null;
            animationFrameId.current = requestAnimationFrame(animate);
        } else if (!isDrawing && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }, [isDrawing, pointsToDraw, animate]);

    return (
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
    );
}