var download = function(str) {
    var blob = new Blob([str], {type: 'application/javascript'});
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'compile.js';
    a.click();
    window.URL.revokeObjectURL(url);
};

module.exports = download;
