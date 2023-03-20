import type { NextRequest } from "next/server";
import { OpenAIStream } from "~/utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest): Promise<Response> {
  if (req.method === "OPTIONS") {
    console.log("req.method ", req.method);
    return new Response(JSON.stringify({ data: "ok" }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  const { question } = (await req.json()) as {
    question?: string;
  };

  if (!question) {
    return new Response(
      JSON.stringify({
        error: "No prompt in the request",
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const stream = await OpenAIStream(question);
  return new Response(stream);
}
