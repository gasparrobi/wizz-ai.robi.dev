/* eslint-disable */
// @ts-nocheck

import { Configuration, OpenAIApi } from "openai";
import { supabase } from "~/lib/supabaseClient";
// import wizzBaggageJson from "./asd.json";

// create json file and uncomment to upload to vector database, json schema:

// [
//   {
//     "title": "content title",
//     "content": "content string"
//   },
// ]

export default async function handler(req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY ?? "",
  });
  const openAi = new OpenAIApi(configuration);

  for (const item of wizzBaggageJson) {
    const embeddingResponse = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input: item.title + ": " + item.content,
    });

    const [{ embedding }] = embeddingResponse.data.data;

    await supabase.from("documents").insert({
      content: item.title + ": " + item.content,
      embedding,
    });
  }

  return;

  const input = text.replace(/\n/g, " ");

  const embeddingResponse = await openAi.createEmbedding({
    model: "text-embedding-ada-002",
    input,
  });

  const [{ embedding }] = embeddingResponse.data.data;

  // In production we should handle possible errors
  supabase
    .from("documents")
    .insert({
      content: text,
      embedding,
    })
    .then((data) => {
      console.log(333);
      console.log(data);
      res.status(200).json({ name: "asd" });
    })
    .catch((error) => {
      console.log(error);
    });
}
