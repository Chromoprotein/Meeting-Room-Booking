import { ChildrenProps } from "../utils/types"

export default function Container({children}: ChildrenProps) {
    return (
        <div className="flex flex-col bg-zinc-200 p-5 my-5 rounded-xl">
            {children}
        </div>
    )
}