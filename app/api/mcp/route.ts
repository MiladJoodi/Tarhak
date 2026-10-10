import { handleTarhakMcpRequest } from "../../../mcp/tarhak-mcp-server/src/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleTarhakMcpRequest(request);
}

export async function POST(request: Request) {
  return handleTarhakMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleTarhakMcpRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleTarhakMcpRequest(request);
}
