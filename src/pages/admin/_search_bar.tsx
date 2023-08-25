"use client"
import React, { ChangeEvent, KeyboardEventHandler, MouseEventHandler, useEffect, useState } from 'react';
interface SearchBarProps {
  subjects: string[];
  on_select: (selected_subject: string) => void;
  included_subjects: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ subjects, on_select, included_subjects }) => {
  useEffect(() => {
    const filteredSubjects = subjects.filter(subject => !included_subjects.includes(subject))
      ;

    setSuggestions(filteredSubjects);

  }, [included_subjects]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [is_focused, set_is_focused] = useState(false);
  const [selection, set_selection] = useState(0);
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    set_is_focused(true);

    // Filter subjects based on the query
    const filteredSubjects = subjects.filter(subject =>
      subject.toLowerCase().includes(newQuery.toLowerCase())

    ).filter(subject => !included_subjects.includes(subject))
      ;

    setSuggestions(filteredSubjects);
  };
  const handleSelectSubject = (subject: string) => {
    on_select(subject); // Run the provided function with the selected subject
    setQuery(''); // Clear the input
    setSuggestions(suggestions => suggestions.filter(subject => !included_subjects.includes(subject))); // Clear suggestions
  };

  const handle_key_press = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      set_selection(selection => selection + 1)
      if (selection >= suggestions.length - 1) {
        set_selection(selection => selection - 1)
      }
      console.log(suggestions[selection], selection)
    }
    if (event.key === "ArrowUp") {
      set_selection(selection => selection - 1)
      if (selection <= 0) {
        set_selection(selection => selection + 1)
      }
      console.log(suggestions[selection], selection)
    }
    if (event.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelectSubject(suggestions[selection]); // Run the function on Enter key press with the first suggestion
        if (selection - 1 >= 0) {
          set_selection(selection => selection - 1)

        }
      }
    }
  };
  const handleSuggestionClick = (e: React.MouseEvent, subject: string) => {
    e.preventDefault()
    handleSelectSubject(subject);
  };
  return (
    <div onFocus={() => set_is_focused(true)}
      onBlur={() => set_is_focused(false)}
      className="flex flex-col text-center relative items-center space-y-7 outline-none"
    >
      <input
        className="bg-[#1f1f1f] text-center w-16 sm:w-full focus:w-full rounded-xl outline-none  px-2 py-1"
        style={is_focused === false ? {} : { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        type="text"
        placeholder="Search subjects..."
        value={query}
        onChange={handleInputChange}
        onClick={() => setSuggestions(subjects.filter(subject => !included_subjects.includes(subject)))}
        onKeyDown={(e) => {
          handle_key_press(e)
        }}
      />
      {
        is_focused === true ?
          <table className="bg-[#1f1f1f] rounded-2xl  rounded-t-none absolute w-full px-2">
            <tbody>
              {suggestions.sort().map((subject, index) => (
                <tr key={index} className="px-2">
                  <td style=
                    {
                      {
                        backgroundColor: index === selection ? "#2a2a2a" : "#1f1f1f",
                        borderBottomLeftRadius: index === selection + 3 || index === suggestions.length - 1 && index != selection ? 180 : 0,
                        borderBottomRightRadius: index === selection + 3 || index === suggestions.length - 1 && index != selection ? 180 : 0
                      }}
                    className=" hover:cursor-pointer  py-1 hover:bg-[#2a2a2a] border-t border-t-[#2b2b2b] text-center" onMouseDown={(e) => handleSuggestionClick(e, subject)} key={index}>{subject}</td>
                </tr>
              )).slice((selection - 1 > 0 ? selection - 1 : 0), selection + 4)
              }
            </tbody>
          </table>
          : null
      }
    </div>
  );
};

export default SearchBar;
