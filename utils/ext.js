function formatString(template, values) {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => values[key]);
}

function onErrorResponse(e, res) {
    console.log(e)
    res.status(500).json({message: "Cannot perform request"})
}

String.prototype.capitalize = function () {
    return this.replace(/\b\w/g, char => char.toUpperCase())
}

module.exports = {
    formatString: formatString,
    onErrorResponse: onErrorResponse
}