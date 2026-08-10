import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createTemplate } from "@/features/templates/service";
import { createTemplateSchema } from "@/features/templates/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (session.user.accountType !== "STAFF") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Staff access required" },
        { status: 403 }
      );
    }

    await authorize(PERMISSIONS.TEMPLATES_CREATE);
    
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);
    
    const { id } = await createTemplate(validated, session.user.id);

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (typeof error === "object" && error !== null && "issues" in error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: (error as any).issues
        },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      // Check if it's a PostgreSQL error
      if ("code" in error) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Database error",
            sqlCode: (error as any).code,
            detail: (error as any).detail || undefined,
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
