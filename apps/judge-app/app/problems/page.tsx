import { api } from "@/app/lib/api";
import Link from "next/link";
import styles from "./Problems.module.css";
import ProblemsFilter from "./ProblemsFilter";
import ProblemsTitle from "./ProblemsTitle";
import Pagination from "./Pagination";
import { Problem } from "@judgeapp/shared/domain/problem"

export default async function ProblemsPage({ searchParams }: Readonly<{ searchParams: Promise<Problem & { q : string, after: string, page?: string }> }>) {
    const q = (await searchParams).q ?? "";
    const difficulty = (await searchParams).difficulty ?? "";
    const after = (await searchParams).after;
    const page = Number.parseInt((await searchParams).page as string) || 1;
    const tagsParam = (await searchParams).tags ?? "";
    const categoryParam = (await searchParams).category ?? "";

    const tagsArray = tagsParam ? String(tagsParam).split(",").map(s => s.trim()).filter(Boolean) : undefined;
    const categoryArray = categoryParam ? String(categoryParam).split(",").map(s => s.trim()).filter(Boolean) : undefined;

    const res = await api.getProblems({
        limit: 20,
        q: q || undefined,
        difficulty: difficulty || undefined,
        after,
        tags: tagsArray,
        category: categoryArray,
    });

    return (
        <main className={styles.container}>
            <ProblemsTitle />

            <ProblemsFilter q={q} difficulty={difficulty} tags={typeof tagsParam === "string" ? tagsParam : tagsParam.join(",")} category={typeof categoryParam === "string" ? categoryParam : categoryParam.join(",")} />

            <div className={styles.grid}>
                {res.problems.map((p: Problem) => (
                    <Link
                        key={p.id}
                        href={`/problems/${p.id}`}
                        className={styles.card}
                    >
                        <div className={styles.header}>
                            <span className={styles.pid}>{p.id}</span>
                            <span className={`${styles.diff} ${styles[p.difficulty]}`}>
                                {p.difficulty}
                            </span>
                        </div>

                        <h2 className={styles.problemTitle}>
                            {p.title}
                        </h2>

                        <p className={styles.desc}>
                            {p.description}
                        </p>

                        <div className={styles.meta}>
                            <span>{p.timeLimitMs} ms</span>
                            <span>{p.memoryLimitMb} MB</span>
                        </div>
                    </Link>
                ))}
            </div>

            {res.nextCursor && (
                <Pagination 
                    q={q} 
                    difficulty={difficulty} 
                    tags={Array.isArray(tagsParam) ? tagsParam.join(",") : tagsParam}
                    category={Array.isArray(categoryParam) ? categoryParam.join(",") : categoryParam}
                    nextCursor={res.nextCursor} 
                    page={page} 
                />
            )}
        </main>
    );
}
