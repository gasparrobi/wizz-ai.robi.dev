export const Chat = ({
  isLoading,
  onSubmit,
  inputRef,
}: ChatProps): JSX.Element => {
  return (
    <form className="relative  w-full text-black" onSubmit={onSubmit}>
      <input
        ref={inputRef}
        name="query"
        type="text"
        disabled={isLoading}
        placeholder="Ask me about Wizz Air baggage policies"
        className="w-full rounded-2xl border border-zinc-500 bg-zinc-800 px-3 py-4 text-xs text-white sm:text-base"
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl border border-zinc-400 bg-zinc-800 py-1 px-4 text-white sm:py-2">
        go
      </button>
    </form>
  );
};

interface ChatProps {
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}
