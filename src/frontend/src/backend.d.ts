import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: bigint;
    postId: bigint;
}
export interface Post {
    id: bigint;
    content: string;
    author: Principal;
    likes: bigint;
    timestamp: bigint;
    image?: ExternalBlob;
}
export interface UserProfile {
    bio: string;
    username: string;
    createdAt: bigint;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(content: string, image: ExternalBlob | null): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getExploreFeed(offset: bigint, limit: bigint): Promise<Array<Post>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getHomeFeed(offset: bigint, limit: bigint): Promise<Array<Post>>;
    getPost(postId: bigint): Promise<Post | null>;
    getProfileByPrincipal(user: Principal): Promise<UserProfile | null>;
    getProfileByUsername(username: string): Promise<UserProfile | null>;
    getUserPosts(user: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    updateProfile(username: string, bio: string, avatar: ExternalBlob | null): Promise<void>;
}
