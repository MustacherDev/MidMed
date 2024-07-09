function Enum() {
    for (let i = 0; i < arguments.length; ++i) {
        this[arguments[i]] = i;
    }
    return this;
}