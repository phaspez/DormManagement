export async function handleResponse(response: Response) {
    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
    }
    return response.json()
}
