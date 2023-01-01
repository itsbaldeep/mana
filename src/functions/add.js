module.exports = (quantity, id, map) => {
    id = id.toString();
    if (map.has(id)) {
        map.set(id, map.get(id) + quantity);
    } else map.set(id, quantity);
};
