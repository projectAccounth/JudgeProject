"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    position = "top",
    delay = 200
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    let hideTimeout: NodeJS.Timeout;

    // Calculate position after tooltip is rendered
    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top = 0;
            let left = 0;

            switch (position) {
                case "top":
                    top = triggerRect.top - tooltipRect.height - 10;
                    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    break;
                case "bottom":
                    top = triggerRect.bottom + 10;
                    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    break;
                case "left":
                    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    left = triggerRect.left - tooltipRect.width - 10;
                    break;
                case "right":
                    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    left = triggerRect.right + 10;
                    break;
            }

            // Keep tooltip within viewport
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) top = 10;

            setTooltipPos({ top, left });
        }
    }, [isVisible, position]);

    const handleMouseEnter = () => {
        hideTimeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(hideTimeout);
        setIsVisible(false);
    };

    return (
        <div
            ref={triggerRef}
            className={styles.trigger}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`${styles.tooltip} ${styles[position]}`}
                    style={{
                        position: "fixed",
                        top: `${tooltipPos.top}px`,
                        left: `${tooltipPos.left}px`,
                        zIndex: 1000
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
