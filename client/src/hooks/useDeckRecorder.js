export default function useDeckReorder() {
  const reorder = (list, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return list;
    if (fromIndex < 0 || fromIndex >= list.length) return list;
    if (toIndex < 0 || toIndex >= list.length) return list;

    const result = [...list];
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    return result;
  };

  return { reorder };
}
