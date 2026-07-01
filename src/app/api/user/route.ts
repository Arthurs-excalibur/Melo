import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email || !session.spotifyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the user from the database. 
    // Prisma's onDelete: Cascade will delete tokens, history, analyses, and share cards.
    await db.user.delete({
      where: { spotifyId: session.spotifyId },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Failed to delete user account data:", err);
    return Response.json({ error: "Failed to delete account data" }, { status: 500 });
  }
}
