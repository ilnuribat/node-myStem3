const MyStem = require('../lib/MyStem');

const myStem = new MyStem();

myStem.start();

const words = ['карусели', 'немцы', 'печалька'];

const promises = words.map((word) => myStem.lemmatize(word));

Promise.all(promises)
  .then((lemmas) => {
    console.log(lemmas);
    myStem.stop();
  });
