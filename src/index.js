const https = require('https');
const fs = require('fs');
const path = require('path');

const parse = (fileName) => {
    const url = 'https://countrycode.org/';
    https.get(url, res => {
        let body = '';
        let openTagIndex, closingTagIndex;
        res.on('data', (d) => body += d);

        res.on("end", () => {
            openTagIndex = body.indexOf('<tbody>');
            closingTagIndex = body.indexOf('</tbody>');
            body = body.substring(openTagIndex, closingTagIndex);
            parseTable(body, fileName)
        })})
        .on('error', (e) => console.error(e));
};

const parseTable = (input, fileName) => {
    let myCountry = {};
    let finishIndex = input.indexOf('</tr>');
    if (finishIndex === -1) {
        console.info("parsing finished");
        return
    }
    finishIndex += 4;

    let nameStart = input.indexOf('\">') + 2;
    let nameEnd = input.indexOf('</a>');
    if (nameEnd === -1) {
        return
    }
    let countryName = input.substring(nameStart, nameEnd);

    input = input.substring(nameEnd + 8);
    let codes = extractTagsData(input);
    let codeLastIndex = codes.dataEnd;
    let countryCodes = codes.data.split(', ');

    input = input.substring(codeLastIndex + 5);
    let lettersIndexStart = input.search(RegExp("<td>")) + 4;
    let lettersIndexLast = input.search(RegExp("</td>"));
    let countryLetters = input.substring(lettersIndexStart, lettersIndexLast);

    input = input.substring(lettersIndexLast + 5);
    let population = extractTagsData(input);
    let popLastIndex = population.dataEnd;
    let countryPopulation = parseFloat(population.data.replace(RegExp(',', 'g'), ''));

    input = input.substring(popLastIndex + 4);
    let areaIndexStart = input.search(RegExp("<td>")) + 4;
    let areaIndexLast = input.search(RegExp("</td>"));
    let countryArea = parseFloat(input
        .substring(areaIndexStart, areaIndexLast)
        .replace(RegExp(',', 'g'), ''));

    input = input.substring(areaIndexLast + 4);
    let gdp = extractTagsData(input);
    let gdpIndexLast = gdp.dataEnd;
    let countryGdp = gdp.data;
    let multiplex = 0.0;
    if(countryGdp.includes('Billion')) {
        multiplex = 1000000000;
    }
    if(countryGdp.includes('Million')) {
        multiplex = 1000000;
    }
    if(countryGdp.includes('Trillion')) {
        multiplex = 1000000000000;
    }
    countryGdp = countryGdp.replace(" Trillion", "",);
    countryGdp = countryGdp.replace(" Million", "",);
    countryGdp = countryGdp.replace(" Billion", "",);
    if (countryGdp === "") {
        countryGdp = "0"
    }
    let countryGdpValue = parseFloat(countryGdp);
    countryGdpValue *= multiplex;

    let gdpPerCapita = -1.0;
    if(countryPopulation !== 0) {
        gdpPerCapita = countryGdpValue / countryPopulation;
    }

    myCountry.name = countryName;
    myCountry.letters = countryLetters;
    myCountry.code = countryCodes;
    myCountry.area = countryArea;
    myCountry.population = countryPopulation;
    myCountry.gdp = countryGdpValue;
    myCountry.gdpPerCapita = gdpPerCapita;

    if(fileName) {
        try {
            fs.appendFileSync(`data/${fileName}`, JSON.stringify(myCountry));
            fs.appendFileSync(`data/${fileName}`, '\n');
        } catch (err) {
            console.error('File append:', err);
            return
        }
    } else {
        try {
            fs.appendFileSync(`data/codesJ.json`, JSON.stringify(myCountry));
            fs.appendFileSync(`data/codesJ.json`, '\n');
        } catch (err) {
            console.error('File append default:', err);
            return
        }
    }

    return parseTable(input, fileName);
};

const extractTagsData = (input) => {
    let dataStart = input.indexOf('<td>') + 4;
    let dataEnd = input.indexOf('</td>');
    let data = input.substring(dataStart, dataEnd);
    return {
        data: data,
        dataEnd: dataEnd
    };
};

module.exports = {
    parse
};