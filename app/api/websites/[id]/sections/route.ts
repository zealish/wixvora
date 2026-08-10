import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getWebsiteById, canUserEditWebsite } from "@/features/websites/queries";
import { updateWebsiteSections } from "@/features/websites/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const website = await getWebsiteById(id);
    if (!website) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canEdit = await canUserEditWebsite(id, session.user.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sections, pageSettings } = body;

    if (!sections || !pageSettings) {
      return NextResponse.json(
        { error: "sections and pageSettings are required" },
        { status: 400 }
      );
    }

    await updateWebsiteSections(id, sections, pageSettings, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save website sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
