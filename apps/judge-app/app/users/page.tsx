"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../admin/AdminLayout.module.css";

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

interface UsersResponse {
    users: User[];
    total: number;
}

export default function UsersSearchPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Please enter a search query");
            return;
        }
        setOffset(0);
        await performSearch(searchQuery);
    };

    const performSearch = async (query: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/admin/users?q=${encodeURIComponent(query)}`,
                { credentials: "include" }
            );
            if (!response.ok) {
                throw new Error("Failed to search users");
            }
            const data: UsersResponse = await response.json();
            setUsers(data.users);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error searching users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setUsers([]);
        setTotal(0);
        setOffset(0);
    };

    return (
        <div className={styles.container} style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px" }}>
            <h1>{t("nav.users") || "Users"}</h1>
            <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
                {t("users.searchDescription") || "Search for users and view their profiles"}
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSearch} className={styles.searchBox}>
                <input
                    type="text"
                    placeholder={t("problems.search_placeholder") || "Search users by username..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton} disabled={loading}>
                    {loading ? t("common.loading") : t("common.search") || "Search"}
                </button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={styles.searchButton}
                    >
                        {t("common.clear") || "Clear"}
                    </button>
                )}
            </form>

            {users.length > 0 && (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t("adminPanel.id")}</th>
                                    <th>{t("adminPanel.username")}</th>
                                    <th>{t("adminPanel.role")}</th>
                                    <th>{t("adminPanel.joined")}</th>
                                    <th>{t("adminPanel.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id.slice(0, 8)}...</td>
                                        <td>{u.username}</td>
                                        <td>{u.role}</td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Link href={`/users/${u.id}`} className={styles.link}>
                                                {t("adminPanel.view") || "View Profile"}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "20px", color: "#9ca3af" }}>
                        {t("adminPanel.of")} {total} {t("users.found") || "user(s) found"}
                    </div>
                </>
            )}

            {!loading && searchQuery && users.length === 0 && !error && (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af"
                }}>
                    <p>{t("users.noResults") || "No users found matching your search"}</p>
                </div>
            )}
        </div>
    );
}
