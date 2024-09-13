# <a href="https://xpl.github.io/what-code-is-faster/">What Code Is Faster?</a>

**A browser-based tool for speedy and correct JS performance comparisons!**

- Minimalistic UI
- Code editor with IntelliSense
- All state is saved to URL - copy it and share with friends in no time!
- Automatically determines the number of iterations needed for a proper measurement — no hard-coding!
- Prevents dead code elimination and compile-time eval. optimizations from ruining your test!
- Verifies correctness (functions must compute the same value, be deterministic, depend on their inputs)
- Warms up functions before measuring (to give time for JIT to compile & optimize them)

<a href="https://xpl.github.io/what-code-is-faster/"><img width="100%" alt="Try it online!" src="https://user-images.githubusercontent.com/1707/101344538-af2ace00-3896-11eb-808c-824a228dc50f.png"></a>

## How Does It Work?

Benchmarked functions are written as _reducers_, i.e. taking a previous value and returning some other value. The runtime executes your functions in a tight loop against some random initial value, saving the final value to a global variable (thus producing a _side effect_), so that no smart compiler could optimize out our computation!

So you must also provide a random initial value (not [something like that](https://xkcd.com/221/)) and ensure that your reducers follow some simple rules. **Those rules are programmatically enforced** — so you won't shoot yourself in the foot. Check the examples to get a sense of how to write a benchmark.

The rules:

1. The result of a function must depend on its input — and only on its input! You cannot return the same value again and again, or return some random values — there should be some genuine non-throwable computation on a passed input.

2. Given the same input, the output of the functions must be all the same. The comparison should be fair — we want to compare different implementations of exactly the same thing!

## Examples

- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqdTj0PgjAQ3fsr3iZNCFHCyk9wdSEMJxRoLAdpC9EY%2FrtQjHFw8oZL3se9d1fFVdeTvUUHspYeGCfXYXYJyDndMvwAQ85Dc63uhxjNxJXXA6%2BE9prMhcykIomnAKzyk2UUZ%2FJdYonroY9kKZY4qFtyNFo172ZANwg4MYpb3yHPc5yO68hPUhmMwRTOs1QG5q1vwoqXeF37v%2F8XFF%2FOEjmy9FeTWKR4AT%2BbX6E%3D">Array push vs. assign to last index</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNp9UctOwzAQvPcrRlxq09CHVPVQKQe4cYBbuVQV2rRWY5Fsiu0UFei%2FY8eJRKpCZEX2rGd2Z5wp3uYlmTcxzPRes4NYzO8y7SSOdgyuy0wZCM1bo0rFTg4TfA0AzdppKl6oqJUVssGAbcXWwSq1Q4rZtPkwgngil48N8a4q%2Fd3bpiTxjWnDMsrVhlsJIM6xxIPeP7ITQU0mvdpi3lXHZFceePZDJz2CTDCZIPc1i%2BrgdKk%2FvQ%2BXk4P2yyK6vJB9JWOWYPURtFYNdG8MncT6t%2FYmilNhK3DlQIwbMl7NkNHFKaj5fNxNKx4zXDaxRB9n%2Fz%2BHrXqvqRCUIOsSbLNo25FEmnaHTAba4BwfII4sDkYdL7gB8qHPuOvSubt2%2Bc8Ye1Akjq6VZizlZaMQY69Z2K%2BnG4zSOFZv1o4dc%2FrPUfQvBz9PYs0i">BigInt (64-bit) vs. number (increment)</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNq1jsEKwjAQRO%2F5irlIE41CzyJ%2BgVfvmxppsN3UbSqI9N%2BtqUh%2FwMvC7pudGee5qluSmy5OlOpd%2FexiQhTkrb9LOhYW14GrFCIjcEiBmjM1g9cGLwWIT4PwrBfiS2y1UaPNLLvpTvxj1gJV5D6BcEA%2BY4PSYIVyAd0PbpdwmTP7koUz%2BwmOdhqfrn%2BIyra0pundrb9xajTqDeIvWf8%3D">Math.hypot or Math.sqrt?</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqVjz0OwjAMhfecwgtqIiokTsCC2FjZTZrSiNRB%2BUFFKHcnSaVCR5Yo9nvPn91HkkFbgj4SnwS8wakQHcEZw7Dzuja3cyWtL1Vi7KpIDiO6O2%2BOFoyVaMqAeVKnpEGH5e8hZwIgvcKg6XZo2q9Nkw4azQVNVDyDGazQDqmzIxcstVVTU1CO0PCHU8%2FZvgTK7qUNG9iLLKQ2P3WrlXtBV%2Bn0x8E%2FrCW7ArIk2AdkO2vC">Do local function declarations affect performance?</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqNj70OwjAMhPc8hRfURFRIzAixIDZW9hBSGpE6yElQEcq7k7Si%2FEwsluw732c3EVUwDqGJyHsBDyAdIiHsZWgX3gzD%2Bdgp50uXGDtqVG0n6cKrrQNlnY%2BkPWRDAIn30Bo8b6q6hI7pBk0w0h6kjZpnCoMvDkk8uY4LlupB033QhNLyK%2BnbaJ8WyqFlDDNYiiykOhfr1I97Qg%2FSLi%2BV55TDfGIPa3hFrP55%2BAP%2FjitslgR7AtISZ6c%3D">Do closures affect performance (vs. free functions)?</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqVj7GOwkAMRPv9iunYFRE6WlCQ7gOokOj3gkNWBC9yNrmcUP6ddUiNdC5ceMZvbC%2BCEt8i%2Fm9TS7zbJ1ria2p22H7lwlTAjgWCQ3nI3XSU8gLTL06UrBdxxvwQV83dy82u6ihoY3wgDiRqwdC98asCdc9VCpEROKTg27Nve7IOTwMIpV4YR5%2BajXi%2B5FOcyeGqKWtm2IfQ8PYDGmWryF3CiFhDb1kkQI1Ylxj382Ca%2B5Khmo6nYmHrJ5%2FI%2Bed%2Fks3kzAvj%2BGda">For..of loop over Set vs. Array</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNptkDFvgzAUhHf%2FittiqwilaysqdcgYdesSdTCuKQ5gI9tQKsR%2F77OTKopUBgvdu%2B%2Fu2d0cUOHVe%2FlTNt4NfEWv7Vdsn%2FC4pw9bAb4UMALVC06G%2Fj4Ec%2FWZqLf6rFXM2MFGb3Tg3RwEG%2BRIU6u%2FcZTjRWK1tqodpO%2F47orNsp90APWTq2ycP0jV7go0k1XROAtjTTSyf08%2BLrAywOs4eUtAbEsv7SftKxhtmGYux2Z34KPX8wUBKBpcORsiFrgGd%2F2cMPHnBBKHhwrLcxa2fF5b0yzJW8FyaNr3rmi43YMv6bnWWx428W8WI%2F0Xf5h3zQ%3D%3D">For..of loop over Object.values vs. Map.forEach</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNp1kD9PwzAQxfd8ittqo8iFsiEViYGBgTIgsUQRclw3cZ2cK9sBqpLvzuVPq1aiHiL53vu9vLNyGCKsYAl3t3QSNdy9xLVrXnCtf0hhHJaPwF5lrMSo0OQGVhx%2B4UhYvQ9kffJe7sXGk%2BUAtcYyVg%2BU3qVTyEWGiO49eoMlu19wEWqjNFtwfpb4IetW97n9RTRyx2yfktl0mGRnPRnP8yNKRmJQf9P%2FCDkFHXVXbEl%2FK7ZaxaHsM1IPHS6sSaFRVY30ls0oBr6CmBBgtXO23fFZCpsWVTQOwaCJRtYDTbseEgCvY%2Bvxv6YJPUjvoKKfYxazI3OiSBKljv18Pp%2BGYdiJ8sjYpfShRa7xJGU2v8ImHU%2F%2BAAGxpI8%3D">Map vs. Object (lookup)</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqtkD9TgzAYxvd8imfxSCzHgSN3yOnmoIvn5DmkECRXSGoaPGrlu5uArdDFpev7Pn%2Fe91dotbPgxvD9s%2FwSyJDEcUyKcWy4KnX71LVrYXZudedlUWV0Sw9ohHq3dTrzDiEkslvca90IrqjEFW4YW4S9qFJUUonS5y3yo5Zvae%2F9PXJ0Rx1S9Ozsnqb5x62cZDKStVBF3XKzoYE3QptZNhUfHW%2Bk3aOoRbFheRCi6lRhpVaQSlrJmwen7inDgQBG2M4o0Edu62jqd5vrkVkcM3wjJo6ClwanloBujfgcY6YUYHrHwcLfDiskzBE78RyVv43n8F7lG7Ism72Su7gUcpU42xD6AzyEy3WP1I%2B1I99FIxkY%2BQHRKbx2">Null or undefined? (equality check)</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqNkNFKwzAUhu%2FzFP%2BNLHEhdF4qE%2FYA9kq8GUNO03QNpmlJ08GYfXfTVhFFZBc5OQlfPv6TavA62taDyvK5DsbkQ1OY0HOSKCS0wIUBwcQhJAZrFGnpBzYy3fo%2BIscWmyz7PFEIdE43u2lXVWgbfoEz%2Fhjr%2B4SOEvxVwgpsH7G3qUuyzbLdHQRjhfG6bii88VXfBUMlTr2CJufmhrrOnVcS1Vdo62205F7IDYb%2FiMqfKNYqkC9TBoFb5ALvyFiKMFGLnad6Wp59z%2FjrH5RS81T7iT0I3CBP%2BChTmXJdoVAz5wfnJP6xzcNdo1vAxfeXjI2CfQDZNZNS">Arguments passing: spread vs. call() vs. apply()</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqFjsEKgzAQRO%2F5iiUUklCR9ir0BwptD4VeRDBqxNAYJUYvIf%2FeqNBaKPS07M7OmymELpuWmycl5%2FvtGvfcDAKmAcTEFYmgHnVpZadBamklVw%2BuRkEZOARghB2Nhgu3TWy4rrqWMuSjRdvQCO2NmFbL2%2FSRae5w3XU4cbjgBifpzs3%2FsIejz7zPWUqCTLKUBDmMQxY4Ppozlo5fdCUsLNRqWecHmq8HOMGfoG2%2F1fMzGnmGXucCYXA%3D">JSON.parse() vs. eval()</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNqlkl1LwzAUhu%2F7K86daTer68QLZYIgghcOL8SbUSRpOxfckpmmfuD23z1JmyZzIIq7GGfn43nfc7JCilrDFCYwOjaf86iwGUVFKVc3oqzesUZimFwAuaV6kbYVzCQwjWEDONLNvFaFlqrG%2Fkul6Ec6V9j3uazEk16coUYC4%2B2wY%2B2g4h5BlcLxWZqmHSx3hvTHuiqxJqo3uF5Kqk9PrArpGj1jTbmBEG6FZtzoouz0kB%2BOjOsxMiNWiWKxouqZHFgMvNZwbyTaX1dSw52SZVPogyHMG1FoLgVwwTWnywe6bCrc4zMCaDU5CgYnI%2BgGQFW6UcL6QTPnES5vJqhReCylJjM6BJa3HEcSFFH2OvWL0gSbZzRH110waIPBKE9c0Ocyl8tyq98j2R6SOSRz48whmUcyh2R7SPMSFBmChWlcylx%2Bx7RZcGB7SO846SW%2F1TJf%2B6ZYyNqwjcIRiLYSHpjYBvOf3Bzbwe0Qv%2By%2F5re3ts2t8T4cuNCcx4dBPvP5n%2B%2FedjGPZx7DPJ6FeObxf3yDvWWCdwj2SAIDe%2FUsrP%2F7PaJt%2FAXzs1VV">Array vs TypedArray Dot Product</a>
- <a href="https://xpl.github.io/what-code-is-faster/?code=eNq1kTFPwzAQhXf%2FiregxjSKUsZWoWoHJAYmRsRgHJdYbc%2FIcaGl5L9zdlVI1Q4sLNbJfvfed2ftqA1Q3qvdo%2F00qDAqy1IIvVJtizvnsBfAlu8fVGgKr6h260xORHfUzJWfq9b8RQezDYbq057d5Z7EdbhiinZGNTe1rJ1F1mLhWbrHytBraMYJGl0Oi%2BqWjyvcYAoyH3GCTGKcajbIpBTixZBu1sovs4HlFEXauAWcRwr1Gx1i3Ri9nA5yLDakg3UESzZYtbqn2mzZM7J7EzaekJ3w4zrhlKXEF0rBVFHaixpkb968J5%2BDDQ7JkR6%2FbxhiJHmUn89JymPk2Wqe7HPRH6Cqqji95EVYXoAdjiZs0OWRpaf7Nxj0dnuBQ3RSfAMoXsbB">instanceof or constructor check?</a>

- <i>..Add your own? Pull Requests are welcome!</i>

## Extended Configuration

In case you test functions operate on differently typed inputs, you might need to provide distinct initial values and provide a customized comparison function, otherwise it won't pass the soundness check. Here is an example:

```js
benchmark('bigint vs number (addition)', {
  initialValues() {
    const seed = 1000000 + (Math.random() * 1000) | 0
    return {
      bigint: BigInt(seed),
      number: seed,
    }
  },
  equal(a, b) {
    return BigInt(a) === BigInt(b)
  }
}, {
  bigint(prev) {
    return prev + 1n
  },
  number(prev) {
    return prev + 1
  }
})
```
