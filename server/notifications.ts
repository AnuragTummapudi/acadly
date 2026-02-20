import { db } from "./db";
import { notifications } from "../shared/schema";

export async function createNotification(
    userId: string,
    title: string,
    message: string
) {
    try {
        await db.insert(notifications).values({ userId, title, message });
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}
