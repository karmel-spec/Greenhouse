import { NextRequest, NextResponse } from "next/server";
import { MCPTools, callMCPTool } from "@/lib/mcp-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tool, args } = body;

    // Handle list_tools for MCP discovery
    if (action === "list_tools" || !tool) {
      return NextResponse.json({
        status: "success",
        tools: MCPTools,
        message: "MCP tools available for Eve integration",
      });
    }

    // Handle tool execution
    if (action === "call_tool" || tool) {
      if (!tool) {
        return NextResponse.json(
          { error: "Tool name is required", status: "error" },
          { status: 400 }
        );
      }

      const result = await callMCPTool(tool, args || {});

      return NextResponse.json({
        status: result.type === "error" ? "error" : "success",
        tool,
        result:
          result.type === "text"
            ? JSON.parse(result.text || "{}")
            : result.text,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: list tools
    return NextResponse.json({
      status: "success",
      tools: MCPTools,
      message: "POST /api/mcp with action or tool parameter",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error in MCP endpoint",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET for tool discovery
  return NextResponse.json({
    status: "success",
    endpoint: "/api/mcp",
    methods: ["GET", "POST"],
    message: "Eve's MCP server for greenhouse data access",
    tools: MCPTools.map((t) => ({
      name: t.name,
      description: t.description,
    })),
    usage: {
      discovery: "POST { action: 'list_tools' }",
      execute_tool: "POST { tool: 'get_plants', args: {...} }",
    },
  });
}
