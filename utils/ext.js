function formatString(template, values) {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => values[key]);
}

function onErrorResponse(e, res) {
    console.log(e)
    res.status(500).json({message: "Cannot perform request"})
}

module.exports = {
    formatString: formatString,
    onErrorResponse: onErrorResponse
}