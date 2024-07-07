function formatString(template, values) {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => values[key]);
}

module.exports = {
    formatString: formatString
}