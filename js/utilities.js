var setLoader = function(DOM, shouldSpin) {
    if(!DOM) return;

    shouldSpin = shouldSpin === undefined ? true : shouldSpin;

    if(shouldSpin) {
        DOM.classList.add('fa-spin');
    } else {
        DOM.classList.remove('fa-spin');
    }
}

module.exports = {
    setLoader
};
