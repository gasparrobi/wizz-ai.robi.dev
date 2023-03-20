export const Disclaimer = (): JSX.Element => {
  return (
    <div className="p-2 text-center text-xs text-zinc-300 sm:text-sm">
      <p>
        Please note that I am currently trained on{" "}
        <a
          href="https://wizzair.com/en-gb/information-and-services/travel-information/baggage"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-zinc-100 underline hover:text-zinc-300"
        >
          Wizz Air baggage policies
        </a>{" "}
        only
      </p>
    </div>
  );
};
