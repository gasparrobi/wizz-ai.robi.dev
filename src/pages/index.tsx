import { type NextPage } from "next";
import { nanoid } from "nanoid";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ExampleQuestion } from "~/components/ExampleQuestion";
import { Chat } from "~/components/Chat";
import { QuestionAndAnswer } from "~/components/QuestionAndAnswer";
import { Footer } from "~/components/Footer";

const Home: NextPage = () => {
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<
    QuestionAndAnswer[]
  >([]);
  const [currentAnswer, setCurrentAnswer] = useState<QuestionAndAnswer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const topDivRef = useRef<HTMLDivElement>(null);

  const onGetAnswer = async (question = "") => {
    if (currentAnswer !== null) {
      setQuestionsAndAnswers((prev) => [
        ...prev,
        {
          ...currentAnswer,
          id: nanoid(10),
        },
      ]);
    }

    setCurrentAnswer({ id: nanoid(10), question, answer: "" });

    const response = await fetch("/api/wizzChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      setIsLoading(false);
      setCurrentAnswer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          answer: "Sorry, something went wrong",
        };
      });

      return;
    }

    const data = response.body;

    if (!data) {
      setIsLoading(false);
      setCurrentAnswer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          answer: "Sorry, something went wrong",
        };
      });

      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let text = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      text += chunkValue;

      setCurrentAnswer((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          answer: text,
        };
      });
    }

    setIsLoading(false);
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    const submissionData = Array.from(formData.entries()).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {}
    ) as { query: string };

    if (!submissionData.query) return setIsLoading(false);
    await askQuestion(submissionData.query);
  };

  const askQuestion = async (question: string) => {
    await onGetAnswer(question);
    if (!inputRef?.current) return;
    inputRef.current.value = "";
  };

  const onExampleClick = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!(event.target as HTMLElement).innerText) return;
    setIsLoading(true);

    await askQuestion((event.target as HTMLElement).innerText);
  };

  useEffect(() => {
    if (!topDivRef?.current) return;

    topDivRef.current.scrollTop = topDivRef.current.scrollHeight;
  }, [currentAnswer]);

  return (
    <>
      <Head>
        <title>Wizz GPT</title>
        <meta name="description" content="Wizz Air specific chat application" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
        <script
          async
          defer
          data-website-id={process.env.STATS_WEBSITE_ID}
          src={process.env.STATS_URL}
        ></script>
      </Head>

      <main className="flex max-h-[100dvh] min-h-[100dvh] flex-col items-center justify-center bg-[#18181b] font-mona">
        <div className="container flex max-h-[100dvh] flex-1 flex-col items-center justify-center gap-4 px-4 py-0 text-white ">
          <div className="flex max-h-[100dvh] w-full flex-1 flex-col gap-4 font-normal">
            <div
              ref={topDivRef}
              className="flex h-full flex-1 flex-col  gap-10 overflow-y-auto [&>:first-child]:mt-auto"
            >
              {questionsAndAnswers.map((qna) => (
                <QuestionAndAnswer key={qna.id} {...qna} />
              ))}
              {currentAnswer && (
                <QuestionAndAnswer
                  key={currentAnswer.id}
                  {...currentAnswer}
                  isNew={true}
                />
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="mb-2 flex gap-2 p-2 text-xs text-zinc-400 sm:text-sm">
                <ExampleQuestion
                  onClick={onExampleClick}
                  isLoading={isLoading}
                  question="Can I bring my emotional support parrot on board?"
                />

                <ExampleQuestion
                  onClick={onExampleClick}
                  isLoading={isLoading}
                  question="I want to bring my snowboard"
                />
                <ExampleQuestion
                  onClick={onExampleClick}
                  isLoading={isLoading}
                  question="Can I bring a bottle of Jack Daniels on board?"
                />
              </div>

              <Chat
                inputRef={inputRef}
                isLoading={isLoading}
                onSubmit={onSubmit}
              />
              <div className="flex items-center justify-between py-2">
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

interface QuestionAndAnswer {
  id: string;
  question: string;
  answer: string;
}
