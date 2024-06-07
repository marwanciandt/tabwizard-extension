import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

export interface LLMResponse {
  prompt: SystemMessage;
  response: string;
}

export async function queryLLM(prompt: string): Promise<LLMResponse> {
  console.log("Using OpenAI API Key:", OPENAI_API_KEY);

  const lm_model = new ChatOpenAI({ model: "gpt-4", apiKey: OPENAI_API_KEY });

  const messages = [
    new SystemMessage(
      `You are to suggest a 3-5 word short description which semantically links the following words\nwords: ${prompt}.`
    ),
    // new HumanMessage("hi!"),
  ];

  const result = await lm_model.invoke(messages);

  const parser = new StringOutputParser();

  const response = await parser.invoke(result);

  const data: LLMResponse = {
    prompt: messages[0],
    response: response,
  };
  return data;
}
