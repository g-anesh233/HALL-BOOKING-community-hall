const prepareHallInput = (body) => {
    if (!body || typeof body !== 'object') {
        return null
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const location = typeof body.location === 'string' ? body.location.trim() : ''
    const image = typeof body.image === 'string' ? body.image.trim() : ''
    const capacity = Number(body.capacity)
    const price = Number(body.price)

    if (
        !name || !location || !image ||
        !Number.isInteger(capacity) || capacity < 1 ||
        !Number.isFinite(price) || price < 0
    ) {
        return null
    }

    const facilities = Array.isArray(body.facilities)
        ? body.facilities
        : typeof body.facilities === 'string'
            ? body.facilities.split(',')
            : []

    return {
        name,
        location,
        image,
        capacity,
        price,
        facilities: facilities
            .filter((facility) => typeof facility === 'string')
            .map((facility) => facility.trim())
            .filter(Boolean),
        description: typeof body.description === 'string' ? body.description.trim() : ''
    }
}

module.exports = prepareHallInput
