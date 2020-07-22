module.exports = (inv, thing, quantity) => {
    let found = false;
    for (let i = 0; i < inv.length; i++) {
        if (!found && inv[i][1] > 0 && inv[i][0] == thing._id.toString() ) {
            found = true;
            inv[i][1] = inv[i][1] + quantity;
        }
    }
    if (!found) inv.push([thing._id, quantity]);
}