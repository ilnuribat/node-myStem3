const { assert } = require('chai');
const MyStem = require('../lib/MyStem');

test('Lemmatize known word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const lemma = await myStem.lemmatize('немцы');

  assert.equal(lemma, 'немец');
  myStem.stop();
});

test('Lemmatize unknown word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const lemma = await myStem.lemmatize('кркркрк');

  assert.equal(lemma, 'кркркрк');
  myStem.stop();
});

test('Lemmatize non word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const lemma = await myStem.lemmatize('123яблоко');

  assert.equal(lemma, '123яблоко');
  myStem.stop();
});

test('Extract all grammemes known word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const grammemes = await myStem.extractAllGrammemes('немцы');
  /*
  Существительное, мужской род, одушевлённое, именительный падеж, множественное число
   */
  assert.deepEqual(grammemes, ['немец', 'S', 'm', 'anim=nom', 'pl']);
  myStem.stop();
});

test('Extract all grammemes non word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const grammemes = await myStem.extractAllGrammemes('шоп78шол');

  assert.equal(grammemes, 'шоп78шол');
  myStem.stop();
});

test('Extract all grammemes unknown word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const grammemes = await myStem.extractAllGrammemes('хелоу');

  assert.deepEqual(grammemes, ['хелоу', 'S', 'persn', 'm', 'anim=abl', 'pl']);
  myStem.stop();
});

test('Extract the full analysis for a known word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const analysis = await myStem.analyze('немцы');

  assert.deepEqual(analysis, { text: 'немцы', analysis: [{ lex: 'немец', gr: 'S,m,anim=nom,pl' }] });

  myStem.stop();
});

test('Extract the full analysis for a non-word', async () => {
  const myStem = new MyStem();
  myStem.start();

  const analysis = await myStem.analyze('шоп78шол');

  assert.deepEqual(analysis, 'шоп78шол');

  myStem.stop();
});
