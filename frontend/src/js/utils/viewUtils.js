let debounceTimeout

export function debounce(callback) {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => callback(), 300)
}