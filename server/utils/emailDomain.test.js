const assert = require('node:assert/strict')
const { test } = require('node:test')
const { getLikelyMisspelledDomain } = require('./emailDomain')

test('suggests Gmail for common misspellings', () => {
    assert.equal(getLikelyMisspelledDomain('gnail.com'), 'gmail.com')
    assert.equal(getLikelyMisspelledDomain('gamil.com'), 'gmail.com')
})

test('allows exact and known legitimate domains', () => {
    assert.equal(getLikelyMisspelledDomain('gmail.com'), null)
    assert.equal(getLikelyMisspelledDomain('mail.com'), null)
})

test('does not flag unrelated or ambiguous domains', () => {
    assert.equal(getLikelyMisspelledDomain('example.org'), null)
    assert.equal(getLikelyMisspelledDomain('notgmail.com'), null)
})
