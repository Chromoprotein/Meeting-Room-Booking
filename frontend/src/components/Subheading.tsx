import { ChildrenProps } from "../utils/types";

export default function Subheading({children}: ChildrenProps) {
    return (
        <h3 className="text-lg font-semibold p-2 m-2">
            {children}
        </h3>
    );
}