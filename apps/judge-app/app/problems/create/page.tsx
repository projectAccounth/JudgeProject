"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/context/AuthContext";
import ProblemPicker from "@/app/components/ProblemPicker";
import { Problem } from "@judgeapp/shared/domain/problem";
import styles from "./create.module.css";
import { useState } from "react";

export default function ProblemCreatePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
        return (
            <main className={styles.container}>
                <div className={styles.error}>{t("common.unauthorized")}</div>
                <Link href="/problems" className={styles.backLink}>
                    ← {t("common.back")}
                </Link>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Link href="/problems" className={styles.backLink}>
                        ← {t("common.back")}
                    </Link>
                    <h1>{t("problems.create_new")}</h1>
                    <p className={styles.subtitle}>{t("problems.create_description")}</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.card}>
                    <h2>{t("problems.from_existing")}</h2>
                    <p className={styles.cardDescription}>{t("problems.select_from_pool")}</p>
                    
                    <ProblemPicker 
                        onSelectProblems={setSelectedProblems}
                        multiSelect={false}
                    />

                    {selectedProblems.length > 0 && (
                        <div className={styles.selectedProblem}>
                            <h3>{t("common.selected")}:</h3>
                            <div className={styles.problemCard}>
                                <h4>{selectedProblems[0].title}</h4>
                                <p>{selectedProblems[0].description?.substring(0, 150)}</p>
                                <Link 
                                    href={`/problems/${selectedProblems[0].id}`}
                                    className={styles.viewButton}
                                >
                                    {t("common.view")} →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.divider}></div>

                <div className={styles.card}>
                    <h2>{t("problems.create_new_problem")}</h2>
                    <p className={styles.cardDescription}>{t("problems.upload_new_problem")}</p>
                    
                    <div className={styles.uploadSection}>
                        <div className={styles.uploadBox}>
                            <div className={styles.uploadIcon}>📤</div>
                            <h3>{t("problems.upload_problem_file")}</h3>
                            <p>{t("problems.supported_formats")}</p>
                            
                            <label htmlFor="problem-file" className={styles.uploadButton}>
                                {t("common.upload")}
                            </label>
                            <input
                                id="problem-file"
                                type="file"
                                accept=".md,.zip,.yaml,.yml"
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className={styles.infoBox}>
                            <h4>{t("problems.problem_format")}</h4>
                            <ul>
                                <li>{t("problems.format_markdown")}</li>
                                <li>{t("problems.format_zip")}</li>
                                <li>{t("problems.format_yaml")}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.card}>
                    <h2>{t("problems.problem_details")}</h2>
                    <p className={styles.cardDescription}>{t("problems.what_included")}</p>
                    
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📝</span>
                            <div>
                                <h4>{t("problems.problem_statement")}</h4>
                                <p>{t("problems.clear_description")}</p>
                            </div>
                        </div>
                        
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🧪</span>
                            <div>
                                <h4>{t("problems.test_cases")}</h4>
                                <p>{t("problems.sample_and_hidden")}</p>
                            </div>
                        </div>
                        
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>⚙️</span>
                            <div>
                                <h4>{t("problems.constraints")}</h4>
                                <p>{t("problems.time_memory")}</p>
                            </div>
                        </div>
                        
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🏷️</span>
                            <div>
                                <h4>{t("problems.metadata")}</h4>
                                <p>{t("problems.difficulty_tags")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
