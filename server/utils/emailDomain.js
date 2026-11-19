const COMMON_EMAIL_DOMAINS = [
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.in',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'me.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'gmx.com',
    'mail.com',
    'zoho.com',
    'yandex.com',
    'msn.com',
    'fastmail.com',
    'hey.com'
]

const COMMON_EMAIL_DOMAIN_SET = new Set(COMMON_EMAIL_DOMAINS)

function isOneEditAway(first, second) {
    if (Math.abs(first.length - second.length) > 1) {
        return false
    }

    if (first.length === second.length) {
        const differences = []
        for (let index = 0; index < first.length; index += 1) {
            if (first[index] !== second[index]) {
                differences.push(index)
            }
        }

        if (differences.length === 1) {
            return true
        }

        if (differences.length !== 2) {
            return false
        }

        const [firstDifference, secondDifference] = differences
        return secondDifference === firstDifference + 1 &&
            first[firstDifference] === second[secondDifference] &&
            first[secondDifference] === second[firstDifference]
    }

    const shorter = first.length < second.length ? first : second
    const longer = first.length < second.length ? second : first
    let shortIndex = 0
    let longIndex = 0
    let skippedCharacter = false

    while (shortIndex < shorter.length && longIndex < longer.length) {
        if (shorter[shortIndex] === longer[longIndex]) {
            shortIndex += 1
            longIndex += 1
        } else if (skippedCharacter) {
            return false
        } else {
            skippedCharacter = true
            longIndex += 1
        }
    }

    return true
}

function getLikelyMisspelledDomain(domain) {
    if (COMMON_EMAIL_DOMAIN_SET.has(domain)) {
        return null
    }

    const matches = COMMON_EMAIL_DOMAINS.filter((commonDomain) =>
        isOneEditAway(domain, commonDomain)
    )

    return matches.length === 1 ? matches[0] : null
}

module.exports = { getLikelyMisspelledDomain }
