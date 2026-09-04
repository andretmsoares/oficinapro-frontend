import { Search } from "lucide-react";
 
import "./searchBar.style.css";

export function SearchBar(props: { placeholder: string; searchTerm: string; setSearchTerm: (term: string) => void }) {
    return (
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={props.placeholder}
            value={props.searchTerm}
            onChange={(e) => props.setSearchTerm(e.target.value)}
          />
        </div>
    )
}