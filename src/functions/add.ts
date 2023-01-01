export const add = (quantity: number, id: number, map: Map<number, number>) => {
    id = id.toString();
    if (map.has(id)) {
        map.set(id, map.get(id) + quantity);
    } else map.set(id, quantity);
};
