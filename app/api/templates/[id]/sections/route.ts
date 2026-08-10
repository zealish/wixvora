import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTemplateById } from "@/features/templates/queries";
import { updateTemplate, assertCanModifyTemplate } from "@/features/templates/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const template = await getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await assertCanModifyTemplate(id, session.user.id, "update");

    const body = await request.json();
    const { sections, pageSettings } = body as { sections: any[]; pageSettings: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!sections || !pageSettings) {
      return NextResponse.json(
        { error: "sections and pageSettings are required" },
        { status: 400 }
      );
    }

    await updateTemplate(id, { id, sections, pageSettings }, session.user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
