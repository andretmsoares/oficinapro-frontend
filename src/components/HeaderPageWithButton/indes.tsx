import { Plus } from "lucide-react";
import { HeaderPage } from "../HeaderPage";
import type { MouseEventHandler } from "react";

import './headerPageWithButton.style.css'

export function HeaderPageWithButton(props: { title: string; subtitle: string; onButtonClick: MouseEventHandler<HTMLButtonElement> | undefined; buttonText: string ; }) {
  return (
      <div className="page-header-with-button">
        <div>
          <HeaderPage
            title={props.title}
            subtitle={props.subtitle}
          />
        </div>

        <button className="add-button" onClick={props.onButtonClick}>
          <Plus size={18} />
          <span>{props.buttonText}</span>
        </button>
      </div>
  );
}
