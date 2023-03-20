import clsx from "clsx";

export const QuestionAndAnswer = ({
  question,
  answer,
  isNew = false,
}: QuestionAndAnswerProps): JSX.Element => {
  return (
    <div className={clsx("flex flex-col", isNew && "animate-appear")}>
      <div className="py-2 px-4 text-xl font-semibold text-zinc-400 sm:text-2xl">
        {question}
      </div>

      <div className="flex max-w-[90%] flex-col py-2 px-4 text-sm leading-normal text-zinc-300 sm:text-base">
        <span className="mb-2 text-xs font-bold uppercase text-blue-500">
          Answer:
        </span>
        {answer.length > 0 ? (
          answer
        ) : (
          <div className="px-4 py-2">
            <div className="stage">
              <div className="dot-elastic bg-zinc-300 before:bg-zinc-300 after:bg-zinc-300"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface QuestionAndAnswerProps {
  question: string;
  answer: string;
  isNew?: boolean;
}
