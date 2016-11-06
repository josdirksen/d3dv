const d3 = require('d3');
const fs = require('fs');
const _ = require('lodash');


d3.queue()
    .defer(d3.csv, "file:words.csv")
    .defer(d3.csv, "file:characters.csv")
    .defer(d3.csv, "file:stopwords.csv")
    .await(function (error, words, characters, stopwords) {
        process(words, characters, stopwords)
    });

function process(words, characters, stopwords) {

    var characterKV = characters.reduce(function(res, el) {
        res[el.id] = el;
        return res;
    }, {});

    var stopWordsMap = stopwords.reduce(function(res, el) {
        res[el.word] = el.word;
        return res;
    }, {});

    var characterWords = {};

    words.forEach(function(row, i) {
        // if character is new, add it to the mapping
        if (!characterWords[row["character_id"]]) {
            characterWords[row["character_id"]] = {};
        }
        var processFor = characterWords[row["character_id"]];

        var wordsInLine = row["normalized_text"].split(" ");
        wordsInLine.forEach(function(word) {
            if (!stopWordsMap[word] && word.length > 2) {
                if (processFor[word]) {
                    processFor[word] = processFor[word] + 1;
                } else {
                    processFor[word] = 1;
                }
            }
        });
    })

    var output = [];
    // filter out the single usages and the 'stopwords'
    Object.keys(characterWords).forEach(function(key) {
       Object.keys(characterWords[key]).forEach(function(wkey) {
            if (characterWords[key][wkey] > 20)  {
                output.push({
                    character: key,
                    word: wkey,
                    count: characterWords[key][wkey],
                    characterName: characterKV[key].normalized_name
                });
            }
       });
    });

    fs.writeFile('./words_filtered.csv',d3.csvFormat(output));

};

