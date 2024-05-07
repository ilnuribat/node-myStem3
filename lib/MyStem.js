const childProcess = require('child_process');
const readline = require('readline');
const path = require('path');

function MyStem(args = {}) {
  Object.assign(args, args, {});

  this.path = args.path || path.join(__dirname, '..', 'vendor', process.platform, 'mystem');

  if (process.platform === 'win32') {
    this.path += '.exe';
  }

  this.handlers = [];
}

MyStem.prototype = {
  start() {
    if (this.mystemProcess) {
      return;
    }

    this.mystemProcess = childProcess.spawn(this.path, ['--format', 'json', '--eng-gr', '-i']);
    const rd = readline.createInterface({ input: this.mystemProcess.stdout, terminal: false });

    rd.on('line', (line) => {
      const handler = this.handlers.shift();

      if (handler) {
        const data = JSON.parse(line);
        handler.resolve(this.getGrammemes(data, handler.onlyLemma) || handler.word);
      }
    });

    this.mystemProcess.on('error', (err) => {
      const handler = this.handlers.shift();

      if (handler) {
        handler.reject(err);
      }
    });

    process.on('exit', () => {
      if (this.mystemProcess) {
        this.mystemProcess.kill();
      }
    });
  },

  stop() {
    if (this.mystemProcess) {
      this.mystemProcess.kill();
    }
  },

  extractAllGrammemes(word) {
    return this.callMyStem(word);
  },

  lemmatize(word) {
    const onlyLemma = true;
    return this.callMyStem(word, onlyLemma);
  },

  callMyStem(word, onlyLemma) {
    const firstWord = word.replace(/(\S+)\s+.*/, '$1'); // take only first word. TODO

    return new Promise((resolve, reject) => {
      if (!this.mystemProcess) {
        throw new Error('You should call MyStem.start()');
      }

      this.mystemProcess.stdin.write(`${firstWord}\n`);

      this.handlers.push({
        resolve,
        reject,
        word: firstWord,
        onlyLemma,
      });
    });
  },

  getGrammemes(data, onlyLemma) {
    if (!data[0]) return undefined;

    if (data[0].analysis.length) {
      if (onlyLemma) {
        return data[0].analysis[0].lex;
      }

      const array = [];
      array.push(data[0].analysis[0].lex);

      data[0].analysis[0].gr.split(',').forEach((elem) => {
        array.push(elem);
      });

      return array;
    }

    return data[0].text;
  },
};

module.exports = MyStem;
