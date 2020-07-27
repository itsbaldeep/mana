module.exports = (quantity, id, map) => {
    id = id.toString();
    if (map.get(id) - quantity == 0) {
        map.delete(id);
    } map.set(id, map.get(id) - quantity);
};
