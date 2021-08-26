module.exports = {
    cache: {},
    get: function (key) {
        return this.cache[key]
    },
    set: function (key, val) {
        this.cache[key] = val;
    }
}