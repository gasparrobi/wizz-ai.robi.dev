export const ExampleQuestion = ({
  question,
  isLoading,
  onClick,
}: ExampleQuestionProps): JSX.Element => {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className="rounded-lg border border-zinc-600 py-1 px-2 transition-colors hover:border-zinc-300 hover:bg-zinc-700 hover:text-zinc-300"
    >
      {question}
    </button>
  );
};

interface ExampleQuestionProps {
  question: string;
  isLoading: boolean;
  onClick: (event: React.SyntheticEvent) => void;
}
