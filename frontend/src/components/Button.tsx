import { ButtonProps } from "../utils/types";

export default function Button({onClick, isDisabled, children}: ButtonProps) {
    return (
        <button 
            onClick={onClick} 
            disabled={isDisabled}
            className="rounded-xl p-2 m-2 bg-zinc-400 border-2 border-transparent hover:border-2 hover:border-indigo-600 max-w-36"
        >
            {children}
        </button>
    );
}