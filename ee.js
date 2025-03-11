const recentKeys = [];
const hashList = [
  "9f98"
];

function sha1(str) {
  const buffer = new TextEncoder('utf-8').encode(str);
  return crypto.subtle.digest('SHA-1', buffer).then((hash) => {
    return Array.prototype.map.call(new Uint8Array(hash), (x) => ('00' + x.toString(16)).slice(-2)).join('');
  });
}

function fetchData(hash) {
  const firstLetter = hash.charAt(0);
  const url = `https://lfavole.github.io/easter-eggs/data/${firstLetter}/${hash}.json`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const musicUrl = `https://lfavole.github.io/easter-eggs/data/${firstLetter}/${data.path}`;
      fetch(musicUrl)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const deobfuscatedBuffer = deobfuscate(new Uint8Array(buffer));
          console.log(deobfuscatedBuffer);
          const audioBlob = new Blob([deobfuscatedBuffer], { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          if (data.message) {
            alert(data.message);
          }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
}

function triangularNumbersCount(max) {
  return Math.ceil((-1 + Math.sqrt(1 + 8 * max)) / 2);
}

function triangularNumbers(max) {
  const count = triangularNumbersCount(max);
  const numbers = [];
  for (let x = 1; x <= count; x++) {
    if (x < max) {
      const num = Math.floor((x * x + x) / 2);
      numbers.push(num);
    }
  }
  return numbers;
}

function twoWayObfuscate(length) {
  const ret = [];
  let index = 0;
  const maxPasses = triangularNumbersCount(length + 1);

  for (let stepNum = 0; stepNum <= maxPasses; stepNum++) {
    const iter = triangularNumbers(length + 1);
    const reverse = stepNum % 2 === 0;
    let toSkip = stepNum;
    let iterated = 0;

    const op = (n) => {
      if (reverse) {
        if (iterated + toSkip >= maxPasses) {
          return;
        }
        iterated += 1;
      } else if (toSkip > 0) {
        toSkip -= 1;
        return;
      }
      n = n - stepNum - 1;
      if (n < length) {
        ret.push([n, index]);
        index += 1;
      }
    };

    if (reverse) {
      iter.reverse().forEach(op);
    } else {
      iter.forEach(op);
    }
  }

  return ret;
}

function obfuscate(data) {
  const ret = Array(data.length).fill(null);
  twoWayObfuscate(data.length).forEach(([origPos, obfuscatedPos]) => {
    ret[obfuscatedPos] = data[origPos];
  });
  return ret;
}

function deobfuscate(data) {
  const length = data.length;
  const ret = new Uint8Array(length);

  twoWayObfuscate(length).forEach(([origPos, obfuscatedPos]) => {
    ret[origPos] = data[obfuscatedPos];
  });

  return ret;
}

document.addEventListener('keypress', async (event) => {
  recentKeys.push(event.key);
  if (recentKeys.length > 50) {
    recentKeys.shift();
  }

  for (let i = 1; i <= 20; i++) {
    if (recentKeys.length >= i) {
      const sequence = recentKeys.slice(-i).join('');
      const hash = await sha1(sequence);
      const shortHash = hash.slice(0, 4);
      if (hashList.includes(shortHash)) {
        fetchData(hash);
      }
    }
  }
});
