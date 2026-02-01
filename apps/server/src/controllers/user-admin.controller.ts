import { UserAdminService } from "../services/user-admin.service";
import { UserRole } from "../domain/user";
import { AppError } from "../errors/app-error";

/**
 * Admin controller for user management endpoints
 */
export class UserAdminController {
    constructor(private userAdminService: UserAdminService) {}

    /**
     * Get all users with pagination
     */
    async getAllUsers(limit: number = 20, offset: number = 0) {
        return this.userAdminService.getAllUsers(limit, offset);
    }

    /**
     * Get user by ID
     */
    async getUser(userId: string) {
        const user = await this.userAdminService.getUserById(userId);
        if (!user) {
            throw new AppError("NOT_FOUND", "User not found", 404);
        }
        return user;
    }

    /**
     * Get public profile
     */
    async getPublicProfile(userId: string) {
        const profile = await this.userAdminService.getPublicProfile(userId);
        if (!profile) {
            throw new AppError("NOT_FOUND", "User not found", 404);
        }
        return profile;
    }

    /**
     * Change user role
     */
    async changeUserRole(
        userId: string,
        newRole: UserRole,
        adminRole: UserRole
    ) {
        const updated = await this.userAdminService.changeUserRole(
            userId,
            newRole,
            adminRole
        );
        if (!updated) {
            throw new AppError("NOT_FOUND", "User not found", 404);
        }
        return {
            id: updated.id,
            username: updated.username,
            role: updated.role,
            message: `User role changed to ${newRole}`,
        };
    }

    /**
     * Search users
     */
    async searchUsers(query: string) {
        return this.userAdminService.searchUsers(query);
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: string) {
        const stats = await this.userAdminService.getUserStats(userId);
        if (!stats) {
            throw new AppError("NOT_FOUND", "User not found", 404);
        }
        return stats;
    }

    /**
     * Get role distribution
     */
    async getRoleDistribution() {
        return this.userAdminService.getRoleDistribution();
    }

    /**
     * Update user info
     */
    async updateUser(
        userId: string,
        updates: { username?: string; role?: UserRole },
        adminRole: UserRole
    ) {
        const updated = await this.userAdminService.updateUser(userId, updates, adminRole);
        if (!updated) {
            throw new AppError("NOT_FOUND", "User not found", 404);
        }
        return {
            id: updated.id,
            username: updated.username,
            role: updated.role,
            message: "User updated successfully",
        };
    }
}
