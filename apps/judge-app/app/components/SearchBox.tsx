"use client";

import styles from "./SearchBox.module.css";

export function SearchBox({
    value,
    onChange,
    placeholder,
}: Readonly<{
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}>) {
    return (
        <input
            className={styles.search}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "Search…"}
        />
    );
}
