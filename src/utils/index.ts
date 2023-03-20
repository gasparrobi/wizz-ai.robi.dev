import GPT3Tokenizer from "gpt3-tokenizer";
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
import stripIndent from "strip-indent";
import { supabase } from "~/lib/supabaseClient";

export const OpenAIStream = async (question: string) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const input = question.replace(/\n/g, " ");

  const embeddingResponse = await fetch(
    "https://api.openai.com/v1/embeddings",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input,
      }),
    }
  );

  const _data = (await embeddingResponse.json()) as EmbeddingResponse;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [{ embedding }] = _data.data;

  const { data } = (await supabase.rpc("match_documents", {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    query_embedding: embedding,
    similarity_threshold: 0.78,
    match_count: 5,
  })) as { data: Data[] };

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  for (let i = 0; i < data.length; i++) {
    const content = data[i]?.document_content ?? "";
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    if (tokenCount > 1500) {
      break;
    }

    contextText += `${content.trim()}\n---\n`;
  }

  const systemContent = stripIndent(`
    You are a very enthusiastic Wizz Air representative who loves
    to help people! Given the following CONTEXT from the Wizz Air baggage
    documentation, answer the question using only that information.
    `);

  const messages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: `CONTEXT: \n${contextText}
      
      USER QUESTION: ${question}`,
    },
  ];

  const payload: OpenAiPayload = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.5,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 500,
    stream: true,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data) as unknown as {
              choices: { delta: { content: string } }[];
            };

            const text = json.choices[0]?.delta.content ?? "";
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

interface OpenAiPayload {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
}

interface EmbeddingResponse {
  data: {
    data: {
      embedding: number[];
    }[];
  };
}

interface Data {
  document_content: string;
}
