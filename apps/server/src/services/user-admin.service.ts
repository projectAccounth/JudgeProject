import { User, UserRole } from "../domain/user";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../errors/app-error";

/**
 * Admin service for user management
 * Handles user operations that only admins can perform
 */
export class UserAdminService {
    constructor(private userRepo: UserRepository) {}

    /**
     * Get all users (paginated)
     */
    async getAllUsers(
        limit: number = 20,
        offset: number = 0
    ): Promise<{ users: User[]; total: number }> {
        const users = await this.userRepo.getAll();
        const total = users.length;
        const paginated = users.slice(offset, offset + limit);
        return { users: paginated, total };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<User | null> {
        return this.userRepo.findById(userId);
    }

    /**
     * Get public profile info for a user (limited data, no password hash)
     */
    async getPublicProfile(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
        };
    }

    /**
     * Change user role
     * Admins can change any role except ADMIN
     * Teachers can change USER/STUDENT roles only (future expansion)
     */
    async changeUserRole(
        targetUserId: string,
        newRole: UserRole,
        adminRole: UserRole
    ): Promise<User | null> {
        // Admin can't change their own role or another admin's role
        if (adminRole === "ADMIN" && newRole === "ADMIN") {
            throw new AppError("FORBIDDEN", "Cannot assign ADMIN role to another user", 403);
        }

        const user = await this.userRepo.findById(targetUserId);
        if (!user) return null;

        // Prevent changing admin's role from ADMIN role
        if (user.role === "ADMIN" && adminRole !== "ADMIN") {
            throw new AppError("FORBIDDEN", "Cannot change admin user role - only admins can modify admins", 403);
        }

        // Update role in database
        user.role = newRole;
        await this.userRepo.update(user);
        return user;
    }

    /**
     * Search users by username
     */
    async searchUsers(query: string): Promise<User[]> {
        const all = await this.userRepo.getAll();
        const lowerQuery = query.toLowerCase();
        return all.filter(u =>
            u.username.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) return null;

        return {
            userId: user.id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
        };
    }

    /**
     * Get role distribution statistics
     */
    async getRoleDistribution() {
        const users = await this.userRepo.getAll();
        const distribution: Record<UserRole, number> = {
            USER: 0,
            STUDENT: 0,
            TEACHER: 0,
            ADMIN: 0,
        };

        users.forEach(user => {
            distribution[user.role]++;
        });

        return distribution;
    }

    /**
     * Update user info (admin endpoint)
     * Can update: username, role
     */
    async updateUser(
        userId: string,
        updates: { username?: string; role?: UserRole },
        adminRole: UserRole
    ): Promise<User | null> {
        const user = await this.userRepo.findById(userId);
        if (!user) return null;

        // Check admin permissions for role changes
        if (updates.role) {
            if (adminRole !== "ADMIN") {
                throw new AppError("FORBIDDEN", "Only admins can change user roles", 403);
            }
            if (updates.role === "ADMIN") {
                throw new AppError("FORBIDDEN", "Cannot assign ADMIN role", 403);
            }
            if (user.role === "ADMIN") {
                throw new AppError("FORBIDDEN", "Cannot modify admin users", 403);
            }
            user.role = updates.role;
        }

        // Update username if provided
        if (updates.username) {
            const trimmed = updates.username.trim().toLowerCase();
            const existing = await this.userRepo.findByUsername(trimmed);
            if (existing && existing.id !== userId) {
                throw new AppError("INVALID_INPUT", "Username already taken", 400);
            }
            user.username = trimmed;
        }

        await this.userRepo.update(user);
        return user;
    }
}
