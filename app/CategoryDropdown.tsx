import { type Category } from "./page";

export default function CategoryDropdown(props:
    {
        setSelectedCategory: (value: React.SetStateAction<string>) => void,
        categoryNames: Category[]
    }) {
    if (props.categoryNames.length === 0)
        return (<></>)
    return (
        <select className="form-select" aria-label="Select reporting category" onChange={(e) => props.setSelectedCategory(e.target.value)}>
            <option value="">Filter by reporting category</option>
            {props.categoryNames?.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
            ))}
        </select>

    )
}