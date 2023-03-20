import { type NextPage } from "next";
import { nanoid } from "nanoid";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ExampleQuestion } from "~/components/ExampleQuestion";
import { Chat } from "~/components/Chat";
import { QuestionAndAnswer } from "~/components/QuestionAndAnswer";
import { Disclaimer } from "~/components/Disclaimer";
import Link from "next/link";

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
                <Disclaimer />
                <div className="flex">
                  <Link
                    href="https://github.com/gasparrobi/wizz-ai.robi.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-team-current focus:text-team-curren text-primary px-2 focus:outline-none"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="fill-zinc-300 transition-colors duration-200 ease-in-out hover:fill-zinc-500"
                    >
                      <title>GitHub</title>
                      <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"></path>
                    </svg>
                  </Link>
                  <Link
                    href="https://twitter.com/gasparrobi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-team-current focus:text-team-current text-primary px-2 focus:outline-none"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="fill-zinc-300 transition-colors duration-200 ease-in-out hover:fill-zinc-500"
                    >
                      <title>Twitter</title>
                      <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path>
                    </svg>
                  </Link>
                </div>
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
