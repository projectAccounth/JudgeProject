import { TeacherService } from "../services/teacher.service";

/**
 * Controller for teacher-specific endpoints
 */
export class TeacherController {
    constructor(private teacherService: TeacherService) {}

    /**
     * Get problems created by the teacher
     */
    async getTeacherProblems(teacherId: string) {
        return this.teacherService.getTeacherProblems(teacherId);
    }

    /**
     * Get submissions for teacher's problems
     */
    async getTeacherSubmissions(teacherId: string, limit: number = 50, offset: number = 0) {
        return this.teacherService.getTeacherSubmissions(teacherId, limit, offset);
    }

    /**
     * Get analytics for teacher
     */
    async getTeacherAnalytics(teacherId: string) {
        return this.teacherService.getTeacherAnalytics(teacherId);
    }

    /**
     * Get submissions for a specific problem
     */
    async getProblemSubmissions(problemId: string, teacherId: string, limit: number = 50, offset: number = 0) {
        return this.teacherService.getProblemSubmissions(problemId, teacherId, limit, offset);
    }
}
