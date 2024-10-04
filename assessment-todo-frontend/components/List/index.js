/**
 * 
 * Params:
 * items: array of todo items - generic to how the item is rendered
 */
const List = ({ items }) => {
    return (
        <ul>
            {items}
        </ul>
    )
}

export default List;