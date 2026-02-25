import React from "react";
import Icon from "../../../components/Icon";

type Props = {
  onClick: () => void;
  label?: string;
};

export default function FloatingAddButton({ onClick, label = "新增資產" }: Props) {
  return (
    <button id="floatingAddBtn" onClick={onClick} aria-label={label} className="floating-add-btn md:hidden">
      <Icon name="plus" className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
