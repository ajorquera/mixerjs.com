var simpleRequest = function(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        var requestObject = {xhr, url};

        xhr.onerror = function(e) {
            reject(requestObject);
        };

        xhr.onload = function(e) {
            var response;

            if (xhr.status < 400) {

                var contentType = xhr.getResponseHeader('Content-Type').replace(' ').split(';');

                if(contentType.indexOf('application/json') !== -1) {
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(e) {
                        response = xhr.responseText;
                    }
                } else {
                    response = xhr.responseText;
                }

                resolve(response);
            } else {
                reject(requestObject);
            }
        };

        xhr.send();
    });
}

module.exports = simpleRequest;
