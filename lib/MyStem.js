const childProcess = require('child_process');
const readline = require('readline');
const path = require('path');

function MyStem(args = {}) {
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
        const options = {
          onlyLemma: handler.onlyLemma,
          fullAnalysis: handler.fullAnalysis,
        };

        handler.resolve(this.getGrammemes(data, options) || handler.word);
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
    return this.callMyStem(word, { onlyLemma: true });
  },

  analyze(word) {
    return this.callMyStem(word, { fullAnalysis: true });
  },

  callMyStem(word, options = {}) {
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
        onlyLemma: options.onlyLemma,
        fullAnalysis: options.fullAnalysis,
      });
    });
  },

  getGrammemes(data, options = {}) {
    if (!data[0]) {
      return null;
    }

    if (data[0].analysis.length) {
      if (options.fullAnalysis) {
        return data[0];
      }

      if (options.onlyLemma) {
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
