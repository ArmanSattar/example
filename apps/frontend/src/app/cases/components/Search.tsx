interface SearchProps {
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Search: React.FC<SearchProps> = ({ handleSearch }) => {
  return (
    <div className="flex justify-start items-center bg-search_bar_gray py-2 px-3 space-x-2 rounded-md h-full w-full">
      <img src="/icons/magnifying_glass.svg" alt="search" className="h-3.5 w-3.5 flex-grow-0" />
      <input
        type="text"
        placeholder="Search"
        className="bg-search_bar_gray max-w-full text-white active:border-none outline-none flex-grow-1"
        onChange={(e) => {
          handleSearch(e);
        }}
      />
    </div>
  );
};
