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
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    authorId: Principal;
    authorName: string;
    likes: bigint;
    timestamp: Time;
}
export interface Post {
    id: bigint;
    content: string;
    authorId: Principal;
    authorName: string;
    likes: bigint;
    timestamp: Time;
    image?: ExternalBlob;
    comments: Array<Comment>;
    reported: boolean;
}
export interface UserProfile {
    name: string;
    accountSuspendedUntil?: Time;
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPosts(): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeComment(postId: bigint, commentId: bigint): Promise<void>;
    likePost(postId: bigint): Promise<void>;
    reportPost(postId: bigint): Promise<void>;
    reportUser(reportedUser: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUniqueUsername(username: string): Promise<void>;
}
