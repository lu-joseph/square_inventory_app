import { useRef } from "react";

export default function PriceChangeInput(props: {}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleClick = async () => {
        if (!inputRef.current) return
        if (isNaN(parseFloat(inputRef.current.value))) return

    }
    return (<>
        <div className="input-group mb-3">
            <input ref={inputRef} type="text" className="form-control" placeholder="New Price" />
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" onClick={() => { handleClick() }} >Update</button>
            </div>
        </div>
    </>)
}